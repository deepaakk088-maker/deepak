import xlsx from 'xlsx';
import path from 'path';

try {
  const filePath = 'd:/task/MD_Daily_Weekly_Tracking_Dashboard.xlsx';
  
  const workbook = xlsx.read(filePath, { type: 'file' }); 
  
  for (const sheetName of workbook.SheetNames) {
    console.log('--- Reading sheet:', sheetName, '---');
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    console.log("Total rows found:", jsonData.length);
    if (jsonData.length > 0) {
      console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));
    }
  }
} catch (error) {
  console.error("Error reading file:", error);
}
