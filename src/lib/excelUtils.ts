import * as XLSX from 'xlsx';
import type { Application, OLevelResult } from './types';

interface ApplicationWithResults extends Application {
  oLevelResults?: OLevelResult[];
}

export function generateApplicationsExcel(applications: ApplicationWithResults[], statusFilter?: string) {
  // Prepare worksheet data
  const worksheetData: any[] = [];
  
  // Header row
  worksheetData.push([
    'ID',
    'Applicant Name',
    'Date of Birth',
    'State',
    'LGA',
    'Program',
    'Status',
    'Created Date',
    'Exam Type',
    'Exam Year',
    'Exam Number',
    'School Name',
    'Subjects & Grades'
  ]);
  
  // Data rows
  applications.forEach((app) => {
    const applicant = typeof app.applicant === 'object' ? app.applicant : null;
    const program = typeof app.program === 'object' ? app.program : null;
    
    const applicantName = applicant 
      ? `${applicant.first_name} ${applicant.last_name}${applicant.orther_names ? ` ${applicant.orther_names}` : ''}`
      : 'N/A';
    
    // Extract date of birth
    const dateOfBirth = applicant?.date_of_birth 
      ? new Date(applicant.date_of_birth).toLocaleDateString() 
      : 'N/A';
    
    // Extract LGA and State
    let lgaName = 'N/A';
    let stateName = 'N/A';
    
    if (applicant?.lga) {
      if (typeof applicant.lga === 'object') {
        lgaName = applicant.lga.name || 'N/A';
        
        // Get state from LGA
        if (applicant.lga.state) {
          if (typeof applicant.lga.state === 'object') {
            stateName = applicant.lga.state.name || 'N/A';
          } else {
            stateName = applicant.lga.state;
          }
        }
      } else {
        lgaName = applicant.lga;
      }
    }
    
    const programName = program ? program.program_name : 'N/A';
    const status = app.status || 'N/A';
    const createdDate = app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A';
    
    // Get O-Level results for this application
    const oLevelResults = app.oLevelResults || [];
    
    if (oLevelResults.length === 0) {
      // No O-Level results - single row
      worksheetData.push([
        app.id,
        applicantName,
        dateOfBirth,
        stateName,
        lgaName,
        programName,
        status,
        createdDate,
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'No O-Level results'
      ]);
    } else {
      // Multiple O-Level results - create a row for each
      oLevelResults.forEach((result, index) => {
        const examType = result.exam_type || 'N/A';
        const examYear = result.exam_year || 'N/A';
        const examNumber = result.exam_number || 'N/A';
        const centerName = result.center_name || 'N/A';
        
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
        
        // First result includes application info, subsequent results repeat application info
        worksheetData.push([
          app.id,
          applicantName,
          dateOfBirth,
          stateName,
          lgaName,
          programName,
          status,
          createdDate,
          examType,
          examYear,
          examNumber,
          centerName,
          subjectsText
        ]);
      });
    }
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // ID
    { wch: 30 }, // Applicant Name
    { wch: 15 }, // Date of Birth
    { wch: 20 }, // State
    { wch: 25 }, // LGA
    { wch: 25 }, // Program
    { wch: 15 }, // Status
    { wch: 15 }, // Created Date
    { wch: 15 }, // Exam Type
    { wch: 12 }, // Exam Year
    { wch: 15 }, // Exam Number
    { wch: 30 }, // School Name
    { wch: 60 }, // Subjects & Grades
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Applications');
  
  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = statusFilter 
    ? `applications-report-compact-${statusFilter}-${dateStr}.xlsx`
    : `applications-report-compact-${dateStr}.xlsx`;
  
  // Write file
  XLSX.writeFile(wb, filename);
}

