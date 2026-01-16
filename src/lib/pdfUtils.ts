import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper TypeScript definitions
import autoTable from 'jspdf-autotable';
import type { Application, OLevelResult } from './types';

interface ApplicationWithResults extends Application {
  oLevelResults?: OLevelResult[];
}

// Format 1: Compact format with O-Level results in text within the main table
export function generateApplicationsPDFCompact(applications: ApplicationWithResults[], statusFilter?: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Applications Report (Compact)', 14, 15);
  
  // Subtitle with filter info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const filterText = statusFilter ? `Status: ${statusFilter.toUpperCase()}` : 'All Applications';
  doc.text(filterText, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 27);
  
  // Prepare table data
  const tableData: any[] = [];
  
  applications.forEach((app) => {
    const applicant = typeof app.applicant === 'object' ? app.applicant : null;
    const program = typeof app.program === 'object' ? app.program : null;
    
    const applicantName = applicant 
      ? `${applicant.first_name} ${applicant.last_name}${applicant.orther_names ? ` ${applicant.orther_names}` : ''}`
      : 'N/A';
    
    const programName = program ? program.program_name : 'N/A';
    const status = app.status || 'N/A';
    const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A';
    
    // Get O-Level results for this application
    const oLevelResults = app.oLevelResults || [];
    
    if (oLevelResults.length === 0) {
      // No O-Level results - single row
      tableData.push([
        app.id,
        applicantName,
        programName,
        status,
        createdDate,
        'No O-Level results'
      ]);
    } else {
      // Multiple O-Level results - create a row for each
      oLevelResults.forEach((result, index) => {
        const examType = result.exam_type || 'N/A';
        const examYear = result.exam_year || 'N/A';
        const examNumber = result.exam_number || 'N/A';
        const centerName = result.center_name || '';
        
        // Format subjects and grades as comma-separated: "Subject - Grade, Subject - Grade"
        let subjectsText = 'No subjects';
        if (result.oLevelSubjects && Array.isArray(result.oLevelSubjects) && result.oLevelSubjects.length > 0) {
          const subjectsList = result.oLevelSubjects
            .map((subject: any) => {
              const subjectName = subject.subject_name || subject.name || 'Unknown';
              const grade = subject.grade || 'N/A';
              return `${subjectName} - ${grade}`;
            })
            .join(', ');
          subjectsText = subjectsList;
        }
        
        // Format exam info
        const examInfo = `${examType} ${examYear}${examNumber ? ` (${examNumber})` : ''}${centerName ? ` - ${centerName}` : ''}`;
        const oLevelText = `${examInfo}: ${subjectsText}`;
        
        // First result includes application info, subsequent results are indented
        if (index === 0) {
          tableData.push([
            app.id,
            applicantName,
            programName,
            status,
            createdDate,
            oLevelText
          ]);
        } else {
          tableData.push([
            '', // Empty ID for continuation rows
            '', // Empty applicant name
            '', // Empty program
            '', // Empty status
            '', // Empty date
            oLevelText
          ]);
        }
      });
    }
  });
  
  // Generate main table
  autoTable(doc as any, {
    head: [['ID', 'Applicant', 'Program', 'Status', 'Created', 'O-Level Results']],
    body: tableData,
    startY: 32,
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 15, fontSize: 7 }, // ID
      1: { cellWidth: 45, fontSize: 7 }, // Applicant
      2: { cellWidth: 35, fontSize: 7 }, // Program
      3: { cellWidth: 25, fontSize: 7 }, // Status
      4: { cellWidth: 30, fontSize: 7 }, // Created
      5: { cellWidth: 90, fontSize: 7 }, // O-Level Results
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Add page numbers
  // @ts-ignore - jsPDF getNumberOfPages method exists but TypeScript types may not include it
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
  const filename = statusFilter 
    ? `applications-report-compact-${statusFilter}-${dateStr}.pdf`
    : `applications-report-compact-${dateStr}.pdf`;
  
  // Save PDF
  doc.save(filename);
}

// Format 2: Detailed format with nested tables for O-Level results
export function generateApplicationsPDFDetailed(applications: ApplicationWithResults[], statusFilter?: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Applications Report (Detailed)', 14, 15);
  
  // Subtitle with filter info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const filterText = statusFilter ? `Status: ${statusFilter.toUpperCase()}` : 'All Applications';
  doc.text(filterText, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 27);
  
  let currentY = 32;
  
  applications.forEach((app, appIndex) => {
    const applicant = typeof app.applicant === 'object' ? app.applicant : null;
    const program = typeof app.program === 'object' ? app.program : null;
    
    const applicantName = applicant 
      ? `${applicant.first_name} ${applicant.last_name}${applicant.orther_names ? ` ${applicant.orther_names}` : ''}`
      : 'N/A';
    
    const programName = program ? program.program_name : 'N/A';
    const status = app.status || 'N/A';
    const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A';
    
    // Get O-Level results for this application
    const oLevelResults = app.oLevelResults || [];
    
    // Check if we need a new page
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }
    
    // Application info row
    const appRowData = [
      [
        app.id.toString(),
        applicantName,
        programName,
        status,
        createdDate,
        oLevelResults.length > 0 ? `${oLevelResults.length} O-Level result(s)` : 'No O-Level results'
      ]
    ];
    
    autoTable(doc as any, {
      head: appIndex === 0 ? [['ID', 'Applicant', 'Program', 'Status', 'Created', 'O-Level Results']] : undefined,
      body: appRowData,
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
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 90 },
      },
      theme: 'striped',
      showHead: appIndex === 0, // Only show header on first application
    });
    
    // Update Y position after main table
    currentY = (doc as any).lastAutoTable.finalY + 3;
    
    // Add O-Level results tables for each result
        oLevelResults.forEach((result) => {
      // Check if we need a new page
      if (currentY > 180) {
        doc.addPage();
        currentY = 20;
      }
      
      const examType = result.exam_type || 'N/A';
      const examYear = result.exam_year || 'N/A';
      const examNumber = result.exam_number || 'N/A';
      const centerName = result.center_name || '';
      
      // Prepare subjects table data
      const subjectsTableData: any[] = [];
      
      if (result.oLevelSubjects && Array.isArray(result.oLevelSubjects) && result.oLevelSubjects.length > 0) {
        result.oLevelSubjects.forEach((subject: any) => {
          const subjectName = subject.subject_name || subject.name || 'Unknown';
          const grade = subject.grade || 'N/A';
          subjectsTableData.push([subjectName, grade]);
        });
      } else {
        subjectsTableData.push(['No subjects', 'N/A']);
      }
      
      // Exam info header text
      const examInfo = `${examType} ${examYear}${examNumber ? ` - Exam No: ${examNumber}` : ''}${centerName ? ` - ${centerName}` : ''}`;
      
      // Create nested table for O-Level subjects
      autoTable(doc as any, {
        head: [[examInfo, '']],
        body: subjectsTableData.map(([subject, grade]) => [subject, grade]),
        startY: currentY,
        margin: { left: 25 }, // Indent the O-Level table
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [139, 92, 246], // Purple color for O-Level tables
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'normal' }, // Subject name
          1: { cellWidth: 20, fontStyle: 'bold', halign: 'center' }, // Grade
        },
        theme: 'striped',
        showHead: true,
      });
      
      // Update Y position after O-Level table
      currentY = (doc as any).lastAutoTable.finalY + 3;
    });
    
    // Add spacing between applications
    currentY += 5;
  });
  
  // Add page numbers
  // @ts-ignore - jsPDF getNumberOfPages method exists but TypeScript types may not include it
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
  const filename = statusFilter 
    ? `applications-report-detailed-${statusFilter}-${dateStr}.pdf`
    : `applications-report-detailed-${dateStr}.pdf`;
  
  // Save PDF
  doc.save(filename);
}

// Legacy function for backward compatibility (uses compact format)
export function generateApplicationsPDF(applications: ApplicationWithResults[], statusFilter?: string) {
  generateApplicationsPDFCompact(applications, statusFilter);
}
