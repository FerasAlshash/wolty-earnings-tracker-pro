import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

export const exportMonthToPDF = async (monthKey: string, monthData: any) => {
  try {
    const doc = new jsPDF();
    const monthDate = parse(monthKey, 'yyyy-MM', new Date());
    const monthName = format(monthDate, 'MMMM yyyy');
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 150, 180);
    doc.text('Wolt Driver Earnings Report', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text(monthName, 105, 30, { align: 'center' });
    
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
    
    // Summary table
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Gross Earnings', `€${summary.totalGross.toFixed(2)}`],
        ['Total Net Earnings', `€${summary.totalNet.toFixed(2)}`],
        ['Total Hours Worked', `${summary.totalHours.toFixed(1)} h`],
        ['Total Orders Completed', `${summary.totalOrders}`],
        ['Days Worked', `${summary.daysWorked}`],
        ['Average Daily Net', `€${(summary.totalNet / summary.daysWorked).toFixed(2)}`],
      ],
      headStyles: {
        fillColor: [0, 150, 180],
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 15, right: 15 },
      theme: 'striped'
    });
    
    // Daily entries table
    const sortedEntries = Object.entries(monthData).sort(([a], [b]) => b.localeCompare(a));
    const dailyData = sortedEntries.map(([date, entry]: [string, any]) => [
      format(new Date(date), 'dd MMM yyyy'),
      `${entry.hours} h`,
      `${entry.orders}`,
      `€${entry.cashReceived.toFixed(2)}`,
      `€${entry.grossEarnings.toFixed(2)}`,
      `€${entry.netEarnings.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Date', 'Hours', 'Orders', 'Cash', 'Gross', 'Net']],
      body: dailyData,
      headStyles: {
        fillColor: [16, 185, 129],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      theme: 'grid',
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    const fileName = `wolt-earnings-${monthKey}.pdf`;
    
    // Check if running on native platform (Android/iOS)
    // @ts-ignore - Capacitor will be available in native build
    const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
    
    if (isNative) {
      // For native apps: save and share
      const pdfOutput = doc.output('datauristring');
      const base64Data = pdfOutput.split(',')[1];
      
      // @ts-ignore - Access Capacitor plugins from window
      const { Filesystem } = window.Capacitor.Plugins;
      // @ts-ignore
      const { Share } = window.Capacitor.Plugins;
      // @ts-ignore
      const { Toast } = window.Capacitor.Plugins;
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: 'DOCUMENTS'
      });
      
      await Share.share({
        title: 'Wolt Earnings Report',
        text: `Earnings report for ${monthName}`,
        url: savedFile.uri,
        dialogTitle: 'Share PDF Report'
      });
      
      await Toast.show({
        text: 'PDF saved successfully!',
        duration: 'short',
        position: 'bottom'
      });
    } else {
      // For web: download directly
      doc.save(fileName);
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    // @ts-ignore
    const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
    if (isNative) {
      try {
        // @ts-ignore
        const { Toast } = window.Capacitor.Plugins;
        await Toast.show({
          text: 'Failed to export PDF',
          duration: 'long',
          position: 'bottom'
        });
      } catch {
        alert('Failed to export PDF');
      }
    } else {
      alert('Failed to export PDF');
    }
  }
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