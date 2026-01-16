import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Dashboard Report PDF - Screenshot version
export async function generateDashboardPDF(elementId: string = 'dashboard-content') {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Dashboard element not found');
    }

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '8px';
    loadingIndicator.style.zIndex = '10000';
    loadingIndicator.textContent = 'Generating PDF report...';
    document.body.appendChild(loadingIndicator);

    try {
      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content is taller than one page, add additional pages
      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `dashboard-report-${dateStr}.pdf`;
      
      // Save PDF
      pdf.save(filename);
    } finally {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);
    }
  } catch (error: any) {
    console.error('Failed to generate dashboard PDF:', error);
    throw error;
  }
}

// Reports Page PDF - Screenshot version
export async function generateReportsPDF(elementId: string = 'reports-content') {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Reports element not found');
    }

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '8px';
    loadingIndicator.style.zIndex = '10000';
    loadingIndicator.textContent = 'Generating PDF report...';
    document.body.appendChild(loadingIndicator);

    try {
      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content is taller than one page, add additional pages
      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `reports-analytics-${dateStr}.pdf`;
      
      // Save PDF
      pdf.save(filename);
    } finally {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);
    }
  } catch (error: any) {
    console.error('Failed to generate reports PDF:', error);
    throw error;
  }
}
