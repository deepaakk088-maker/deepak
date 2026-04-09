import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { supabase } from './services/supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const EXCEL_FILE_PATH = 'd:/task/MD_Daily_Weekly_Tracking_Dashboard.xlsx';
const JSON_OUTPUT_PATH = 'd:/task/tracking_data.json';

// Helper function to format excel fractional time to HH:MM format
function extractTime(timeVal) {
    if (typeof timeVal === 'number') {
        const totalMinutes = Math.floor(timeVal * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    if (typeof timeVal === 'string') {
        // e.g. "10:00 am" or "10.00 am"
        try {
            const cleanStr = timeVal.replace(/\./g, ':').trim().toLowerCase();
            const match = cleanStr.match(/(\d+):(\d+)\s*(am|pm)/);
            if (match) {
                let hours = parseInt(match[1]);
                const mins = match[2];
                if (match[3] === 'pm' && hours < 12) hours += 12;
                if (match[3] === 'am' && hours === 12) hours = 0;
                return `${String(hours).padStart(2, '0')}:${mins}`;
            }
        } catch (e) {
             console.error("Failed to parse string time:", timeVal);
        }
    }
    
    return "09:00"; // default fallback time
}

async function run() {
    console.log("Reading Excel file...");
    
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
        console.error("Excel file not found at", EXCEL_FILE_PATH);
        return;
    }
    
    // Read with cellDates to automatically convert Excel serial dates to JS Date objects
    const workbook = xlsx.read(EXCEL_FILE_PATH, { type: 'file', cellDates: true });
    
    const sheetName = 'Weekly_Tracker';
    if (!workbook.SheetNames.includes(sheetName)) {
        console.error(`Sheet '${sheetName}' not found.`);
        return;
    }
    
    const worksheet = workbook.Sheets[sheetName];
    // use raw:true but since we use cellDates, dates are JS objects
    const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    
    console.log(`Extracted ${rawData.length} rows. Filtering valid tasks...`);
    
    const tasksToImport = [];
    
    for (const row of rawData) {
        const rawTask = row['Task / Meeting'];
        const rawDate = row['Date'];
        const rawTime = row['Time'];
        
        // Skip empty rows
        if (!rawTask || typeof rawTask !== 'string' || !rawTask.trim()) {
            continue;
        }
        if (!rawDate) {
             continue; // Exclude if no date is set at all
        }

        let dateStr;
        if (rawDate instanceof Date) {
             // Extract YYYY-MM-DD from JS Date
             dateStr = rawDate.toISOString().split('T')[0];
        } else if (typeof rawDate === 'number') { 
            continue; // should be covered by cellDates
        } else {
             // string fallback
             dateStr = String(rawDate);
             if (dateStr.length < 5) continue; 
        }

        const timeStr = extractTime(rawTime);
        const scheduledTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();
        
        tasksToImport.push({
            message: row['Task / Meeting'].trim(),
            scheduled_time: scheduledTime,
            is_sent: false,
            // storing a record of the original task details
            original_date: dateStr,
            original_time: timeStr,
            place: row['Place'] || ''
        });
    }
    
    console.log(`Found ${tasksToImport.length} valid tasks to import.`);

    // Requirement 1: Convert that into json format
    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(tasksToImport, null, 2));
    console.log(`Saved JSON data to ${JSON_OUTPUT_PATH}`);

    // Requirement 2: Schedule the reminders automatically (insert to Supabase)
    if (!supabase) {
         console.error("Supabase client is not configured properly in .env");
         return;
    }
    
    console.log("Inserting into Supabase database...");
    
    let successCount = 0;
    
    // We do batch in chunks or one by one to ensure we don't hit payload limits
    for(const task of tasksToImport) {
         const { error } = await supabase
            .from('tasks')
            .insert([{
                message: task.message,
                scheduled_time: task.scheduled_time,
                is_sent: false
            }]);
            
         if (error) {
             console.error("Error inserting task:", task.message, error);
         } else {
             successCount++;
         }
    }
    
    console.log(`Successfully scheduled ${successCount} tasks in Supabase.`);
}

run();
