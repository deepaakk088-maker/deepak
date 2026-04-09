import xlsx from 'xlsx';
import path from 'path';

try {
  const filePath = 'd:/task/MD_Daily_Weekly_Tracking_Dashboard.xlsx';
  console.log('Reading file:', filePath);
  
  // Read only the first sheet to be memory efficient and fast for inspection
  const workbook = xlsx.read(filePath, { type: 'file', sheetRows: 10 }); 
  
  const sheetName = workbook.SheetNames[0];
  console.log('Available sheets:', workbook.SheetNames);
  console.log('Reading sheet:', sheetName);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(JSON.stringify(jsonData, null, 2));
} catch (error) {
  console.error("Error reading file:", error);
}
