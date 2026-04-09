import cron from 'node-cron';
import { supabase } from './services/supabaseClient.js';
import { sendMessage, getClientStatus } from './services/whatsappService.js';
import dotenv from 'dotenv';
dotenv.config();

const targetNumber = process.env.WHATSAPP_TARGET_NUMBER;

export const startScheduler = () => {
    console.log("Starting scheduler...");
    
    // Check every minute
    cron.schedule('* * * * *', async () => {
        if (!getClientStatus()) {
             return;
        }

        if (!supabase) {
             console.error("Supabase client not configured.");
             return;
        }

        const now = new Date().toISOString();
        
        try {
            // Find tasks that are due and haven't been sent
            const { data: tasks, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('is_sent', false)
                .lte('scheduled_time', now);
                
            if (error) {
                console.error("Error fetching tasks:", error);
                return;
            }
            
            if (tasks && tasks.length > 0) {
                console.log(`Found ${tasks.length} due tasks to send.`);
                
                for (const task of tasks) {
                    if (!targetNumber) {
                        console.error("WHATSAPP_TARGET_NUMBER not defined in .env");
                        continue;
                    }
                    
                    const success = await sendMessage(targetNumber, `🔔 Reminder: ${task.message}`);
                    
                    if (success) {
                        // Mark as sent
                        await supabase
                            .from('tasks')
                            .update({ is_sent: true })
                            .eq('id', task.id);
                        console.log(`Task ${task.id} marked as sent.`);
                    }
                }
            }
        } catch (err) {
            console.error("Error in scheduler cron job:", err);
        }
    });
};
