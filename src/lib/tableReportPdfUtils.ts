import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper TypeScript definitions
import autoTable from 'jspdf-autotable';
import type { Application, Payment, Applicant } from './types';

interface TableReportData {
  applications?: Application[];
  payments?: Payment[];
  applicants?: Applicant[];
  totalApplicants?: number;
  totalApplications?: number;
  totalPayments?: number;
  totalRevenue?: number;
  statusChartData?: Array<{ name: string; value: number }>;
  monthlyChartData?: Array<{ name: string; applications: number }>;
  paymentChartData?: Array<{ name: string; amount: number }>;
}

// Generate comprehensive table report PDF
export function generateTableReportPDF(data: TableReportData) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Comprehensive Data Report', 105, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
  
  let currentY = 35;
  
  // Statistics Summary Section
  if (data.totalApplicants !== undefined || data.totalApplications !== undefined || 
      data.totalPayments !== undefined || data.totalRevenue !== undefined) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics Summary', 14, currentY);
    currentY += 8;
    
    const statsTableData = [];
    if (data.totalApplicants !== undefined) {
      statsTableData.push(['Total Applicants', data.totalApplicants.toString()]);
    }
    if (data.totalApplications !== undefined) {
      statsTableData.push(['Total Applications', data.totalApplications.toString()]);
    }
    if (data.totalPayments !== undefined) {
      statsTableData.push(['Total Payments', data.totalPayments.toString()]);
    }
    if (data.totalRevenue !== undefined) {
      statsTableData.push(['Total Revenue', `₦${data.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`]);
    }
    
    if (statsTableData.length > 0) {
      autoTable(doc as any, {
        head: [['Metric', 'Value']],
        body: statsTableData,
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'right' },
        },
        theme: 'striped',
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  }
  
  // Application Status Distribution
  if (data.statusChartData && data.statusChartData.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Application Status Distribution', 14, currentY);
    currentY += 8;
    
    const statusTableData = data.statusChartData.map(item => [
      item.name,
      item.value.toString()
    ]);
    
    autoTable(doc as any, {
      head: [['Status', 'Count']],
      body: statusTableData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'right' },
      },
      theme: 'striped',
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Applications Over Time
  if (data.monthlyChartData && data.monthlyChartData.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Applications Over Time', 14, currentY);
    currentY += 8;
    
    const monthlyTableData = data.monthlyChartData.map(item => [
      item.name,
      item.applications.toString()
    ]);
    
    autoTable(doc as any, {
      head: [['Month', 'Applications']],
      body: monthlyTableData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'right' },
      },
      theme: 'striped',
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Payment Revenue Over Time
  if (data.paymentChartData && data.paymentChartData.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Revenue Over Time', 14, currentY);
    currentY += 8;
    
    const paymentTableData = data.paymentChartData.map(item => [
      item.name,
      `₦${item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    ]);
    
    autoTable(doc as any, {
      head: [['Month', 'Revenue']],
      body: paymentTableData,
      startY: currentY,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'right' },
      },
      theme: 'striped',
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Applications Table
  if (data.applications && data.applications.length > 0) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Applications Data', 14, currentY);
    currentY += 8;
    
    const applicationsTableData = data.applications.map((app) => {
      const applicant = typeof app.applicant === 'object' ? app.applicant : null;
      const program = typeof app.program === 'object' ? app.program : null;
      
      const applicantName = applicant 
        ? `${applicant.first_name} ${applicant.last_name}${applicant.orther_names ? ` ${applicant.orther_names}` : ''}`
        : 'N/A';
      
      const programName = program ? program.program_name : 'N/A';
      const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A';
      
      return [
        app.id.toString(),
        applicantName,
        programName,
        app.status || 'N/A',
        createdDate,
      ];
    });
    
    autoTable(doc as any, {
      head: [['ID', 'Applicant', 'Program', 'Status', 'Created Date']],
      body: applicationsTableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
      theme: 'striped',
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Payments Table
  if (data.payments && data.payments.length > 0) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payments Data', 14, currentY);
    currentY += 8;
    
    const paymentsTableData = data.payments.map((payment) => {
      const applicant = typeof payment.applicant === 'object' ? payment.applicant : null;
      const applicantName = applicant 
        ? `${applicant.first_name} ${applicant.last_name}`
        : 'N/A';
      
      const createdDate = payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A';
      const amount = payment.amount ? `₦${parseFloat(payment.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦0.00';
      
      return [
        payment.id.toString(),
        payment.transaction_reference || 'N/A',
        amount,
        applicantName,
        createdDate,
      ];
    });
    
    autoTable(doc as any, {
      head: [['ID', 'Transaction Reference', 'Amount', 'Applicant', 'Date']],
      body: paymentsTableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
      },
      theme: 'striped',
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Applicants Table
  if (data.applicants && data.applicants.length > 0) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Applicants Data', 14, currentY);
    currentY += 8;
    
    const applicantsTableData = data.applicants.map((applicant) => {
      const fullName = `${applicant.first_name} ${applicant.last_name}${applicant.orther_names ? ` ${applicant.orther_names}` : ''}`;
      const lga = typeof applicant.lga === 'object' ? applicant.lga.name : applicant.lga || 'N/A';
      const createdDate = applicant.created_at ? new Date(applicant.created_at).toLocaleDateString() : 'N/A';
      
      return [
        applicant.id.toString(),
        fullName,
        applicant.email || 'N/A',
        applicant.phone_number || 'N/A',
        applicant.gender || 'N/A',
        lga,
        createdDate,
      ];
    });
    
    autoTable(doc as any, {
      head: [['ID', 'Name', 'Email', 'Phone', 'Gender', 'LGA', 'Created Date']],
      body: applicantsTableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
      },
      theme: 'striped',
    });
  }
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `table-report-${dateStr}.pdf`;
  
  // Save PDF
  doc.save(filename);
}

