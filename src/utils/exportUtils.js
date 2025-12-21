import * as XLSX from "xlsx";
import { createExcelTemplateWithCharts, exportStatisticsToExcelAdvanced } from "./excelTemplateGenerator";

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the Excel sheet
 */
export const exportToExcel = (data, filename = "export", sheetName = "Sheet1") => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate Excel file and download
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};

/**
 * Export multiple sheets to Excel with better formatting
 * @param {Array} sheets - Array of {name: string, data: Array}
 * @param {string} filename - Name of the file
 */
export const exportMultipleSheetsToExcel = (sheets, filename = "export") => {
  try {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach((sheet) => {
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      
      // Set column widths for better readability
      const maxWidth = 50;
      const minWidth = 12;
      const colWidths = [];
      
      if (sheet.data.length > 0) {
        const headers = Object.keys(sheet.data[0]);
        headers.forEach((header, idx) => {
          const maxLength = Math.max(
            header.length,
            ...sheet.data.map((row) => {
              const val = row[header];
              if (val === null || val === undefined) return 0;
              return String(val).length;
            })
          );
          colWidths[idx] = { 
            wch: Math.max(Math.min(maxLength + 3, maxWidth), minWidth) 
          };
        });
        ws["!cols"] = colWidths;
      }
      
      // Freeze header row
      ws["!freeze"] = { x: 0, y: 1 };
      
      // Add auto filter to header row
      if (sheet.data.length > 0) {
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        ws["!autofilter"] = {
          ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: 0, c: range.e.c }
          })
        };
      }
      
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`, {
      bookType: "xlsx",
      bookSST: false,
      type: "binary"
    });
    
    return true;
  } catch (error) {
    console.error("Error exporting multiple sheets to Excel:", error);
    throw error;
  }
};

/**
 * Export HTML table to PDF using window.print()
 * @param {string} elementId - ID of the element to print
 * @param {string} filename - Name of the PDF file
 */
export const exportToPDF = (elementId, filename = "export") => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Không thể mở cửa sổ in. Vui lòng cho phép popup.");
    }
    
    const currentDate = new Date().toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Get the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              margin: 1.5cm 1.5cm 2cm 1.5cm;
              size: A4;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Inter', 'Segoe UI', 'Calibri', Arial, sans-serif;
              padding: 0;
              margin: 0;
              color: #1f2937;
              background: #ffffff;
              line-height: 1.6;
            }
            /* Cover Page */
            .cover-page {
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              text-align: center;
              padding: 60px 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .cover-title {
              font-size: 42px;
              font-weight: 800;
              color: #ffffff;
              margin-bottom: 20px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.2);
              letter-spacing: -0.5px;
            }
            .cover-subtitle {
              font-size: 22px;
              color: rgba(255,255,255,0.9);
              margin-bottom: 60px;
              font-weight: 300;
            }
            .cover-date {
              margin-top: 40px;
              font-size: 16px;
              color: rgba(255,255,255,0.8);
            }
            /* Header & Footer */
            .header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 15px;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 45px;
              background: #f8fafc;
              color: #64748b;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 25px;
              font-size: 11px;
              border-top: 2px solid #e2e8f0;
              font-weight: 500;
            }
            .page-number::before {
              content: "Trang " counter(page);
            }
            /* Content */
            .content {
              margin-top: 70px;
              margin-bottom: 55px;
              padding: 30px;
            }
            .report-header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 25px;
              border-bottom: 4px solid #f97316;
              background: linear-gradient(to bottom, #fff7ed 0%, #ffffff 100%);
              padding: 30px 20px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .report-title {
              color: #f97316;
              margin-bottom: 15px;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .report-meta {
              color: #475569;
              font-size: 14px;
              margin: 8px 0;
              font-weight: 500;
            }
            /* Statistics Cards */
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              transition: transform 0.2s;
              page-break-inside: avoid;
            }
            .stat-card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
            }
            .stat-icon {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
            }
            .stat-value {
              font-size: 32px;
              font-weight: 800;
              color: #1e40af;
              margin-bottom: 6px;
              line-height: 1.2;
            }
            .stat-label {
              font-size: 13px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-subvalue {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 8px;
              font-weight: 500;
            }
            /* Tables */
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-bottom: 30px;
              font-size: 12px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            th, td {
              border: none;
              padding: 14px 16px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #1e3a8a;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:nth-child(odd) {
              background-color: white;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            td {
              border-bottom: 1px solid #e2e8f0;
            }
            /* Cards */
            .card {
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              background: white;
              page-break-inside: avoid;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .card-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 18px;
              color: #1e40af;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .card-title::before {
              content: "▸";
              color: #f97316;
              font-size: 24px;
            }
            /* Charts */
            .chart-container {
              margin: 30px 0;
              padding: 24px;
              background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
              border-radius: 12px;
              border: 2px solid #e2e8f0;
              page-break-inside: avoid;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .chart-title {
              font-size: 18px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 16px;
              padding-bottom: 10px;
              border-bottom: 2px solid #cbd5e1;
            }
            .chart-caption {
              font-size: 12px;
              color: #64748b;
              font-style: italic;
              margin-top: 12px;
              line-height: 1.6;
              padding: 12px;
              background: #f1f5f9;
              border-radius: 6px;
              border-left: 4px solid #3b82f6;
            }
            .chart-placeholder {
              padding: 50px;
              text-align: center;
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border-radius: 8px;
              color: #64748b;
              border: 2px dashed #cbd5e1;
            }
            .chart-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              margin: 16px 0;
              display: block;
            }
            /* Improve spacing */
            h1, h2, h3 {
              margin-top: 0;
              margin-bottom: 16px;
            }
            p {
              margin-bottom: 12px;
            }
            /* Better grid layout */
            .grid {
              display: grid;
              gap: 20px;
            }
            /* Icon styling */
            svg {
              width: 24px;
              height: 24px;
            }
            /* Lists */
            .list-item {
              padding: 14px 16px;
              margin-bottom: 8px;
              background: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .list-item:nth-child(even) {
              background: white;
              border-left-color: #f97316;
            }
            .rank-badge {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 14px;
              margin-right: 12px;
            }
            /* Print specific */
            @media print {
              .no-print {
                display: none !important;
              }
              .cover-page {
                page-break-after: always;
              }
              .card, .chart-container {
                page-break-inside: avoid;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div class="cover-title">BÁO CÁO THỐNG KÊ HỆ THỐNG</div>
            <div class="cover-subtitle">Hệ thống quản lý hoạt động - Sự kiện</div>
            <div class="cover-date">
              <p>Ngày xuất: ${currentDate}</p>
            </div>
          </div>
          
          <!-- Header -->
          <div class="header">BÁO CÁO THỐNG KÊ HỆ THỐNG</div>
          
          <!-- Footer -->
          <div class="footer">
            <span>${currentDate}</span>
            <span class="page-number"></span>
          </div>
          
          <!-- Content -->
          <div class="content">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
    
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};

/**
 * Export statistics data to Excel with formatted sheets
 * @param {Object} statsData - Statistics data object
 * @param {string} academicYearName - Name of academic year
 * @param {string} tabName - Current tab name
 */
export const exportStatisticsToExcel = (statsData, academicYearName = "Tất cả", tabName = "overview") => {
  // Use advanced template with charts instructions
  return exportStatisticsToExcelAdvanced(statsData, academicYearName, tabName);
};

