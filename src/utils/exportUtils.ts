import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { EarningsData } from '@/types/earnings';
import { format, parse } from 'date-fns';

interface SummaryData {
  totalGross: number;
  totalNet: number;
  totalHours: number;
  totalOrders: number;
  daysWorked: number;
}

export const exportMonthToPDF = (monthKey: string, monthData: any) => {
  const doc = new jsPDF();
  const monthDate = parse(monthKey, 'yyyy-MM', new Date());
  const monthName = format(monthDate, 'MMMM yyyy');
  
  // Header
  doc.setFontSize(20);
  doc.text(`Wolt Earnings Report - ${monthName}`, 20, 30);
  
  // Calculate summary
  const entries = Object.values(monthData);
  const summary: SummaryData = {
    totalGross: 0,
    totalNet: 0,
    totalHours: 0,
    totalOrders: 0,
    daysWorked: 0
  };
  
  entries.forEach((entry: any) => {
    summary.totalGross += entry.grossEarnings;
    summary.totalNet += entry.netEarnings;
    summary.totalHours += entry.hours;
    summary.totalOrders += entry.orders;
    summary.daysWorked += 1;
  });
  
  // Summary section
  doc.setFontSize(14);
  doc.text('Monthly Summary:', 20, 50);
  doc.setFontSize(12);
  doc.text(`Total Gross: €${summary.totalGross.toFixed(2)}`, 20, 65);
  doc.text(`Total Net: €${summary.totalNet.toFixed(2)}`, 20, 75);
  doc.text(`Total Hours: ${summary.totalHours.toFixed(1)}`, 20, 85);
  doc.text(`Total Orders: ${summary.totalOrders}`, 20, 95);
  doc.text(`Days Worked: ${summary.daysWorked}`, 20, 105);
  
  // Daily entries
  doc.setFontSize(14);
  doc.text('Daily Entries:', 20, 125);
  
  let yPosition = 140;
  const sortedEntries = Object.entries(monthData).sort(([a], [b]) => b.localeCompare(a));
  
  sortedEntries.forEach(([date, entry]: [string, any]) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(10);
    doc.text(`${format(new Date(date), 'MMM dd, yyyy')}`, 20, yPosition);
    doc.text(`Hours: ${entry.hours}h`, 20, yPosition + 10);
    doc.text(`Orders: ${entry.orders}`, 70, yPosition + 10);
    doc.text(`Cash: €${entry.cashReceived.toFixed(2)}`, 120, yPosition + 10);
    doc.text(`Gross: €${entry.grossEarnings.toFixed(2)}`, 20, yPosition + 20);
    doc.text(`Net: €${entry.netEarnings.toFixed(2)}`, 120, yPosition + 20);
    
    yPosition += 35;
  });
  
  doc.save(`wolt-earnings-${monthKey}.pdf`);
};

export const exportMonthToExcel = (monthKey: string, monthData: any) => {
  const monthDate = parse(monthKey, 'yyyy-MM', new Date());
  const monthName = format(monthDate, 'MMMM yyyy');
  
  // Prepare data for Excel
  const excelData = Object.entries(monthData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entry]: [string, any]) => ({
      Date: format(new Date(date), 'yyyy-MM-dd'),
      Hours: entry.hours,
      Orders: entry.orders,
      'Cash Received (€)': entry.cashReceived,
      'Gross Earnings (€)': entry.grossEarnings,
      'Net Earnings (€)': entry.netEarnings
    }));
  
  // Calculate summary
  const summary = excelData.reduce((acc, entry) => ({
    'Total Hours': acc['Total Hours'] + entry.Hours,
    'Total Orders': acc['Total Orders'] + entry.Orders,
    'Total Cash (€)': acc['Total Cash (€)'] + entry['Cash Received (€)'],
    'Total Gross (€)': acc['Total Gross (€)'] + entry['Gross Earnings (€)'],
    'Total Net (€)': acc['Total Net (€)'] + entry['Net Earnings (€)'],
    'Days Worked': acc['Days Worked'] + 1
  }), {
    'Total Hours': 0,
    'Total Orders': 0,
    'Total Cash (€)': 0,
    'Total Gross (€)': 0,
    'Total Net (€)': 0,
    'Days Worked': 0
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add summary sheet
  const summaryWs = XLSX.utils.json_to_sheet([summary]);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Add daily data sheet
  const dataWs = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, dataWs, 'Daily Data');
  
  // Save file
  XLSX.writeFile(wb, `wolt-earnings-${monthKey}.xlsx`);
};