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
              font-family: 'Inter', 'Segoe UI', 'Calibri', 'Arial', sans-serif;
              padding: 0;
              margin: 0;
              color: #1e293b;
              background: #ffffff;
              line-height: 1.7;
            }
            /* Cover Page - Professional Blue Theme */
            .cover-page {
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              text-align: center;
              padding: 80px 50px;
              background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
              color: white;
              position: relative;
              overflow: hidden;
            }
            .cover-page::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: 
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%);
              pointer-events: none;
            }
            .cover-title {
              font-size: 48px;
              font-weight: 900;
              color: #ffffff;
              margin-bottom: 24px;
              text-shadow: 0 4px 12px rgba(0,0,0,0.3);
              letter-spacing: -1px;
              line-height: 1.2;
              position: relative;
              z-index: 1;
            }
            .cover-subtitle {
              font-size: 24px;
              color: rgba(255,255,255,0.95);
              margin-bottom: 80px;
              font-weight: 400;
              letter-spacing: 0.5px;
              position: relative;
              z-index: 1;
            }
            .cover-date {
              margin-top: 60px;
              font-size: 16px;
              color: rgba(255,255,255,0.85);
              font-weight: 500;
              position: relative;
              z-index: 1;
              padding: 16px 32px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
              backdrop-filter: blur(10px);
            }
            /* Header & Footer - Professional Blue */
            .header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 65px;
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
              letter-spacing: 1px;
              box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
              border-bottom: 3px solid #3b82f6;
              z-index: 1000;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 50px;
              background: linear-gradient(to top, #eff6ff 0%, #dbeafe 100%);
              color: #1e40af;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 30px;
              font-size: 12px;
              border-top: 3px solid #3b82f6;
              font-weight: 600;
              z-index: 1000;
            }
            .page-number::before {
              content: "Trang " counter(page);
              color: #1e40af;
            }
            /* Content */
            .content {
              margin-top: 75px;
              margin-bottom: 60px;
              padding: 35px;
            }
            /* Report Header - Professional Blue Theme */
            .report-header {
              text-align: center;
              margin-bottom: 45px;
              padding: 40px 30px;
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
              border-radius: 16px;
              box-shadow: 0 8px 24px rgba(30, 58, 138, 0.15);
              border: 2px solid #3b82f6;
              position: relative;
              overflow: hidden;
            }
            .report-header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
            }
            .report-title {
              color: #1e3a8a;
              margin-bottom: 18px;
              font-size: 36px;
              font-weight: 800;
              letter-spacing: -0.8px;
              text-shadow: 0 2px 4px rgba(30, 58, 138, 0.1);
            }
            .report-meta {
              color: #1e40af;
              font-size: 15px;
              margin: 10px 0;
              font-weight: 600;
              display: inline-block;
              padding: 8px 20px;
              background: rgba(255,255,255,0.7);
              border-radius: 20px;
              margin: 8px 5px;
            }
            /* Statistics Cards - Professional Blue Cards */
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 24px;
              margin-bottom: 35px;
            }
            .stat-card {
              background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
              border: 2px solid #bfdbfe;
              border-left: 5px solid #2563eb;
              border-radius: 14px;
              padding: 28px;
              margin-bottom: 24px;
              box-shadow: 0 4px 16px rgba(30, 58, 138, 0.12);
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
            }
            .stat-card::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 100px;
              height: 100px;
              background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
              pointer-events: none;
            }
            .stat-card-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
            }
            .stat-icon {
              width: 52px;
              height: 52px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 26px;
              font-weight: bold;
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              color: white;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            .stat-value {
              font-size: 38px;
              font-weight: 900;
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 8px;
              line-height: 1.1;
            }
            .stat-label {
              font-size: 13px;
              color: #475569;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 4px;
            }
            .stat-subvalue {
              font-size: 13px;
              color: #64748b;
              margin-top: 10px;
              font-weight: 600;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
            }
            /* Tables - Professional Blue Theme */
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-bottom: 35px;
              font-size: 13px;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(30, 58, 138, 0.1);
              border: 2px solid #dbeafe;
            }
            th, td {
              border: none;
              padding: 16px 18px;
              text-align: left;
            }
            th {
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
              color: white;
              font-weight: 800;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 3px solid #1e40af;
              text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            tr:nth-child(even) {
              background-color: #f0f9ff;
            }
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            tr:hover {
              background-color: #dbeafe;
            }
            td {
              border-bottom: 1px solid #e0e7ff;
              color: #1e293b;
              font-weight: 500;
            }
            tbody tr:last-child td {
              border-bottom: none;
            }
            /* Cards - Professional Blue Theme */
            .card {
              border: 2px solid #bfdbfe;
              border-left: 6px solid #2563eb;
              border-radius: 14px;
              padding: 28px;
              margin-bottom: 28px;
              background: linear-gradient(to bottom, #ffffff 0%, #f8faff 100%);
              page-break-inside: avoid;
              box-shadow: 0 4px 16px rgba(30, 58, 138, 0.1);
              position: relative;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 6px;
              height: 100%;
              background: linear-gradient(180deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
              border-radius: 14px 0 0 14px;
            }
            .card-title {
              font-size: 22px;
              font-weight: 800;
              margin-bottom: 20px;
              color: #1e3a8a;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 14px;
              display: flex;
              align-items: center;
              gap: 12px;
              letter-spacing: -0.3px;
            }
            .card-title::before {
              content: "▸";
              color: #2563eb;
              font-size: 28px;
              font-weight: 900;
              text-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
            }
            /* Charts - Professional Blue Theme */
            .chart-container {
              margin: 35px 0;
              padding: 30px;
              background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f8faff 100%);
              border-radius: 14px;
              border: 2px solid #bfdbfe;
              border-top: 4px solid #2563eb;
              page-break-inside: avoid;
              box-shadow: 0 4px 20px rgba(30, 58, 138, 0.12);
              position: relative;
            }
            .chart-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
              border-radius: 14px 14px 0 0;
            }
            .chart-title {
              font-size: 20px;
              font-weight: 800;
              color: #1e3a8a;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 3px solid #3b82f6;
              letter-spacing: -0.3px;
            }
            .chart-caption {
              font-size: 12px;
              color: #475569;
              font-style: italic;
              margin-top: 16px;
              line-height: 1.7;
              padding: 14px 18px;
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border-radius: 8px;
              border-left: 5px solid #2563eb;
              font-weight: 500;
            }
            .chart-placeholder {
              padding: 60px;
              text-align: center;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-radius: 10px;
              color: #475569;
              border: 2px dashed #93c5fd;
              font-weight: 500;
            }
            .chart-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              border-radius: 10px;
              box-shadow: 0 6px 20px rgba(30, 58, 138, 0.15);
              margin: 20px 0;
              display: block;
              border: 2px solid #dbeafe;
            }
            /* Typography - Professional Blue Theme */
            h1, h2, h3, h4, h5, h6 {
              margin-top: 0;
              margin-bottom: 18px;
              color: #1e3a8a;
              font-weight: 800;
              letter-spacing: -0.3px;
            }
            h1 {
              font-size: 32px;
              border-bottom: 4px solid #2563eb;
              padding-bottom: 12px;
            }
            h2 {
              font-size: 26px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 10px;
            }
            h3 {
              font-size: 22px;
              color: #2563eb;
            }
            p {
              margin-bottom: 14px;
              color: #475569;
              line-height: 1.7;
            }
            /* Better grid layout */
            .grid {
              display: grid;
              gap: 24px;
            }
            /* Icon styling */
            svg {
              width: 24px;
              height: 24px;
              color: #2563eb;
            }
            /* Section dividers */
            .section-divider {
              height: 3px;
              background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
              margin: 35px 0;
              border-radius: 2px;
            }
            /* Highlight boxes */
            .highlight-box {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border-left: 5px solid #2563eb;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 4px 12px rgba(30, 58, 138, 0.1);
            }
            /* Lists - Professional Blue Theme */
            .list-item {
              padding: 16px 20px;
              margin-bottom: 10px;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-radius: 10px;
              border-left: 5px solid #2563eb;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 2px 8px rgba(30, 58, 138, 0.08);
              transition: all 0.2s;
            }
            .list-item:nth-child(even) {
              background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
              border-left-color: #3b82f6;
            }
            .rank-badge {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 15px;
              margin-right: 14px;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              border: 2px solid rgba(255,255,255,0.3);
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
            <div class="cover-title">BÁO CÁO THỐNG KÊ<br/>HỆ THỐNG</div>
            <div class="cover-subtitle">Phân tích dữ liệu hoạt động & Sự kiện</div>
            <div class="cover-date">
              <p>Ngày xuất báo cáo: ${currentDate}</p>
            </div>
          </div>
          
          <!-- Header -->
          <div class="header">📊 BÁO CÁO THỐNG KÊ HỆ THỐNG</div>
          
          <!-- Footer -->
          <div class="footer">
            <span>📅 ${currentDate}</span>
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

