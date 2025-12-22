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

/**
 * Generate analysis content for statistics report
 * Tạo nội dung phân tích cho báo cáo thống kê
 */
const generateAnalysisContent = (element, statsData = {}, reportType = "overview") => {
  const analysis = {
    statDescriptions: [],
    chartAnalyses: [],
    rankingComments: [],
    conclusion: ""
  };

  // Extract statistics from element
  const statCards = element.querySelectorAll('.stat-card, [class*="stat"]');
  statCards.forEach(card => {
    const valueEl = card.querySelector('[class*="text-2xl"], [class*="text-3xl"], .stat-value');
    const labelEl = card.querySelector('[class*="text-sm"], [class*="text-gray"], .stat-label');
    
    if (valueEl && labelEl) {
      const label = labelEl.textContent.trim();
      const value = valueEl.textContent.trim();
      
      // Generate description based on label
      let description = "";
      if (label.toLowerCase().includes('người dùng') || label.toLowerCase().includes('user')) {
        description = "Phản ánh quy mô hệ thống tại thời điểm báo cáo.";
      } else if (label.toLowerCase().includes('lớp') || label.toLowerCase().includes('class')) {
        description = "Tổng số lớp học đang hoạt động trong hệ thống.";
      } else if (label.toLowerCase().includes('sự kiện') || label.toLowerCase().includes('hoạt động') || label.toLowerCase().includes('activity')) {
        description = "Tổng số sự kiện và hoạt động đã được tạo trong hệ thống.";
      } else if (label.toLowerCase().includes('điểm') || label.toLowerCase().includes('point')) {
        description = "Thể hiện mức độ tham gia và tương tác của người học.";
      } else if (label.toLowerCase().includes('tham gia') || label.toLowerCase().includes('participation')) {
        description = "Tỷ lệ người học tham gia các hoạt động so với tổng số đăng ký.";
      } else {
        description = "Chỉ số quan trọng phản ánh hoạt động của hệ thống.";
      }
      
      analysis.statDescriptions.push({ label, value, description });
    }
  });

  // Extract chart analyses
  const charts = element.querySelectorAll('.chart-container, [class*="chart"], svg');
  charts.forEach((chart, index) => {
    const titleEl = chart.querySelector('.chart-title, [class*="CardTitle"], h3, h4');
    const title = titleEl ? titleEl.textContent.trim() : `Biểu đồ ${index + 1}`;
    
    // Generate analysis based on chart type
    let analysisText = "";
    if (title.toLowerCase().includes('timeline') || title.toLowerCase().includes('theo thời gian')) {
      analysisText = "Xu hướng hoạt động theo thời gian cho thấy mức độ ổn định hoặc biến động của hệ thống.";
    } else if (title.toLowerCase().includes('điểm') || title.toLowerCase().includes('point')) {
      analysisText = "Phân bố điểm số phản ánh mức độ tích cực tham gia của các đơn vị.";
    } else if (title.toLowerCase().includes('phân loại') || title.toLowerCase().includes('type')) {
      analysisText = "Cơ cấu phân loại cho thấy sự đa dạng trong các loại hoạt động.";
    } else {
      analysisText = "Dữ liệu thể hiện xu hướng và phân bố của chỉ số được phân tích.";
    }
    
    analysis.chartAnalyses.push({ title, analysis: analysisText });
  });

  // Extract ranking tables
  const rankingTables = element.querySelectorAll('table, .ranking-item, [class*="ranking"]');
  rankingTables.forEach((table, index) => {
    const rows = table.querySelectorAll('tr, .ranking-item, [class*="flex items-center"]');
    if (rows.length > 0) {
      const topValue = rows[0]?.querySelector('td:last-child, .ranking-value')?.textContent || "";
      const totalRows = rows.length;
      
      let comment = "";
      if (totalRows >= 10) {
        comment = `Nhóm dẫn đầu chiếm phần lớn tổng điểm. Sự chênh lệch rõ rệt giữa top đầu và các đơn vị còn lại. Một số đơn vị có tham gia nhưng chưa phát sinh điểm đáng kể.`;
      } else {
        comment = `Phân bố điểm số tập trung vào một số đơn vị. Cần khuyến khích sự tham gia đồng đều hơn.`;
      }
      
      analysis.rankingComments.push({ index, comment });
    }
  });

  // Generate conclusion
  const totalUsers = statsData.dashboardStats?.userCounts?.totalUsers || 0;
  const totalActivities = statsData.dashboardStats?.activityCounts?.totalActivities || 0;
  const totalPoints = statsData.dashboardStats?.totalPointsAwarded || 0;
  
  let conclusion = "";
  if (reportType === "overview") {
    conclusion = `Hệ thống hiện có ${totalUsers} người dùng và ${totalActivities} sự kiện đã được tạo. Tổng điểm đã trao là ${totalPoints.toLocaleString()} điểm. `;
    if (totalActivities > 0 && totalPoints > 0) {
      const avgPoints = Math.round(totalPoints / totalActivities);
      conclusion += `Trung bình mỗi sự kiện trao ${avgPoints.toLocaleString()} điểm. `;
    }
    conclusion += `Định hướng cải thiện: tăng số lượng sự kiện, khuyến khích các lớp ít tham gia tích cực hơn.`;
  } else {
    conclusion = `Báo cáo phản ánh tình hình hoạt động của hệ thống trong kỳ báo cáo. Cần tiếp tục duy trì và phát triển các hoạt động hiệu quả.`;
  }
  
  analysis.conclusion = conclusion;

  return analysis;
};

/**
 * Process content for PDF export - add analysis and descriptions
 * Xử lý nội dung để thêm phân tích và mô tả
 */
const processContentForPDF = (element, analysis) => {
  const clonedElement = element.cloneNode(true);
  
  // Add descriptions to stat cards
  analysis.statDescriptions.forEach((stat, index) => {
    const statCards = clonedElement.querySelectorAll('.stat-card, [class*="stat"]');
    if (statCards[index]) {
      const card = statCards[index];
      const labelEl = card.querySelector('.stat-label, [class*="text-sm"]');
      if (labelEl) {
        const descEl = document.createElement('div');
        descEl.className = 'stat-description';
        descEl.style.cssText = 'font-size: 9pt; color: #666666; margin-top: 6px; font-style: italic; line-height: 1.4;';
        descEl.textContent = stat.description;
        labelEl.parentNode.insertBefore(descEl, labelEl.nextSibling);
      }
    }
  });
  
  // Add analysis to charts
  analysis.chartAnalyses.forEach((chartAnalysis, index) => {
    const charts = clonedElement.querySelectorAll('.chart-container, [class*="chart"]');
    if (charts[index]) {
      const chart = charts[index];
      const analysisEl = document.createElement('div');
      analysisEl.className = 'chart-analysis';
      analysisEl.style.cssText = 'font-size: 9pt; color: #333333; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e5e5; line-height: 1.5;';
      analysisEl.textContent = chartAnalysis.analysis;
      chart.appendChild(analysisEl);
    }
  });
  
  // Add comments to ranking tables
  analysis.rankingComments.forEach((comment, index) => {
    const tables = clonedElement.querySelectorAll('table, .ranking-list');
    if (tables[index]) {
      const table = tables[index];
      const commentEl = document.createElement('div');
      commentEl.className = 'ranking-comment';
      commentEl.style.cssText = 'margin-top: 15px; padding: 12px; background: #f8f8f8; border-left: 3px solid #1e3a5f; font-size: 9pt; color: #333333; line-height: 1.6;';
      commentEl.innerHTML = `<strong>Nhận xét:</strong><ul style="margin-top: 8px; padding-left: 20px;">${comment.comment.split('.').filter(s => s.trim()).map(s => `<li>${s.trim()}.</li>`).join('')}</ul>`;
      table.parentNode.insertBefore(commentEl, table.nextSibling);
    }
  });
  
  return clonedElement.innerHTML;
};

/**
 * Export statistics to PDF with professional administrative/business report style
 * Phong cách hành chính/chuyên nghiệp: tối giản, nghiêm túc, trung tính
 * Tập trung vào mật độ thông tin và giá trị phân tích
 * @param {string} elementId - ID of the element to print
 * @param {string} filename - Name of the PDF file
 * @param {Object} options - Additional options (academicYear, reportType, statsData, etc.)
 */
export const exportStatisticsToPDFProfessional = (
  elementId, 
  filename = "BaoCaoThongKe", 
  options = {}
) => {
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
    
    const reportDate = new Date().toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const academicYear = options.academicYear || "Tất cả năm học";
    const reportType = options.reportType || "Tổng quan";
    const statsData = options.statsData || {};
    
    // Generate analysis content
    const analysis = generateAnalysisContent(element, statsData, reportType);
    
    // Process element content to add analysis
    const processedContent = processContentForPDF(element, analysis);
    
    // Get the HTML content with professional administrative styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            @page {
              margin: 1.8cm 1.5cm 2.2cm 1.5cm;
              size: A4;
              @bottom-center {
                content: counter(page);
                font-family: 'Inter', 'Roboto', 'Arial', sans-serif;
                font-size: 10px;
                color: #666666;
              }
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Inter', 'Roboto', 'Noto Sans', 'Arial', sans-serif;
              padding: 0;
              margin: 0;
              color: #000000;
              background: #ffffff;
              line-height: 1.6;
              font-size: 11pt;
            }
            
            /* Cover Page - Professional Administrative Style */
            .cover-page {
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              text-align: center;
              padding: 60px 40px;
              background: #ffffff;
              border: 1px solid #e5e5e5;
            }
            .cover-title {
              font-size: 28pt;
              font-weight: 700;
              color: #000000;
              margin-bottom: 20px;
              letter-spacing: 1px;
              line-height: 1.3;
              text-transform: uppercase;
            }
            .cover-subtitle {
              font-size: 14pt;
              color: #333333;
              margin-bottom: 40px;
              font-weight: 400;
              line-height: 1.5;
            }
            .cover-meta {
              margin-top: 60px;
              font-size: 11pt;
              color: #666666;
              font-weight: 400;
              border-top: 1px solid #e5e5e5;
              padding-top: 20px;
              width: 100%;
              max-width: 500px;
            }
            .cover-meta-item {
              margin-bottom: 8px;
            }
            
            /* Footer - Professional Style */
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 40px;
              background: #ffffff;
              color: #666666;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 20px;
              font-size: 9pt;
              border-top: 1px solid #e5e5e5;
              font-weight: 400;
              z-index: 1000;
            }
            .footer-left {
              font-weight: 500;
              color: #333333;
            }
            .footer-center {
              color: #666666;
            }
            .footer-right {
              color: #666666;
            }
            
            /* Content - Compact Layout */
            .content {
              margin-top: 0;
              margin-bottom: 40px;
              padding: 0;
            }
            
            /* Report Header - Minimal Professional - Compact */
            .report-header {
              text-align: center;
              margin-bottom: 20px;
              padding: 20px 15px;
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-bottom: 2px solid #1e3a5f;
            }
            .report-title {
              color: #000000;
              margin-bottom: 10px;
              font-size: 18pt;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .report-meta {
              color: #666666;
              font-size: 10pt;
              margin: 5px 0;
              font-weight: 400;
            }
            
            /* Statistics Cards - Minimal Professional - Compact Layout */
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 12px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-left: 3px solid #1e3a5f;
              padding: 15px;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .stat-value {
              font-size: 24pt;
              font-weight: 700;
              color: #000000;
              margin-bottom: 5px;
              line-height: 1.2;
            }
            .stat-label {
              font-size: 10pt;
              color: #666666;
              font-weight: 400;
              text-transform: none;
              letter-spacing: 0;
            }
            .stat-subvalue {
              font-size: 9pt;
              color: #666666;
              margin-top: 8px;
              font-weight: 400;
              padding-top: 8px;
              border-top: 1px solid #f0f0f0;
            }
            .stat-description {
              font-size: 9pt;
              color: #666666;
              margin-top: 6px;
              font-style: italic;
              line-height: 1.4;
            }
            
            /* Tables - Professional Administrative Style */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              font-size: 10pt;
              background: #ffffff;
              border: 1px solid #e5e5e5;
            }
            th, td {
              border: 1px solid #e5e5e5;
              padding: 10px 12px;
              text-align: left;
            }
            th {
              background: #f8f8f8;
              color: #000000;
              font-weight: 600;
              font-size: 10pt;
              text-transform: none;
              letter-spacing: 0;
              border-bottom: 2px solid #1e3a5f;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            td {
              color: #333333;
              font-weight: 400;
            }
            
            /* Charts - Minimal Professional - Compact */
            .chart-container {
              margin-bottom: 18px;
              page-break-inside: avoid;
              background: #ffffff;
              border: 1px solid #e5e5e5;
              padding: 15px;
            }
            .chart-title {
              font-size: 12pt;
              font-weight: 600;
              color: #000000;
              margin-bottom: 12px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e5e5;
            }
            .chart-image {
              width: 100%;
              height: auto;
              border: 1px solid #e5e5e5;
            }
            .chart-caption {
              font-size: 9pt;
              color: #666666;
              margin-top: 10px;
              font-style: italic;
              text-align: center;
            }
            .chart-analysis {
              font-size: 9pt;
              color: #333333;
              margin-top: 12px;
              padding-top: 10px;
              border-top: 1px solid #e5e5e5;
              line-height: 1.5;
            }
            .ranking-comment {
              margin-top: 15px;
              padding: 12px;
              background: #f8f8f8;
              border-left: 3px solid #1e3a5f;
              font-size: 9pt;
              color: #333333;
              line-height: 1.6;
            }
            .ranking-comment ul {
              margin-top: 8px;
              padding-left: 20px;
            }
            .ranking-comment li {
              margin-bottom: 4px;
            }
            /* Conclusion Page */
            .conclusion-page {
              page-break-before: always;
              padding: 30px 20px;
            }
            .conclusion-title {
              font-size: 14pt;
              font-weight: 700;
              color: #000000;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #1e3a5f;
            }
            .conclusion-content {
              font-size: 10pt;
              color: #333333;
              line-height: 1.8;
              margin-bottom: 25px;
            }
            .conclusion-section {
              margin-bottom: 20px;
            }
            .conclusion-section-title {
              font-size: 11pt;
              font-weight: 600;
              color: #000000;
              margin-bottom: 10px;
            }
            .conclusion-section-content {
              font-size: 10pt;
              color: #333333;
              line-height: 1.7;
              padding-left: 15px;
            }
            
            /* Cards - Minimal Professional - Compact */
            .card {
              background: #ffffff;
              border: 1px solid #e5e5e5;
              margin-bottom: 15px;
              page-break-inside: avoid;
            }
            .card-header {
              padding: 12px 15px;
              border-bottom: 1px solid #e5e5e5;
              background: #f8f8f8;
            }
            .card-title {
              font-size: 12pt;
              font-weight: 600;
              color: #000000;
              margin: 0;
            }
            .card-content {
              padding: 15px;
            }
            
            /* Lists & Rankings - Professional Table Style */
            .ranking-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .ranking-item {
              padding: 12px 15px;
              border-bottom: 1px solid #f0f0f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .ranking-item:last-child {
              border-bottom: none;
            }
            .ranking-number {
              font-weight: 600;
              color: #1e3a5f;
              margin-right: 15px;
              min-width: 30px;
            }
            .ranking-name {
              flex: 1;
              color: #333333;
              font-weight: 400;
            }
            .ranking-value {
              color: #000000;
              font-weight: 600;
              text-align: right;
            }
            
            /* Typography */
            h1, h2, h3, h4, h5, h6 {
              color: #000000;
              font-weight: 600;
              margin-bottom: 15px;
              margin-top: 25px;
            }
            h1 {
              font-size: 16pt;
              border-bottom: 2px solid #1e3a5f;
              padding-bottom: 8px;
            }
            h2 {
              font-size: 14pt;
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 6px;
            }
            h3 {
              font-size: 12pt;
            }
            p {
              color: #333333;
              margin-bottom: 10px;
            }
            
            /* Remove all decorative elements */
            .no-print,
            button,
            .btn,
            [class*="gradient"],
            [class*="shadow"],
            [style*="gradient"],
            [style*="shadow"] {
              /* Keep functionality but remove visual effects */
            }
            
            /* Print specific */
            @media print {
              .no-print {
                display: none !important;
              }
              .cover-page {
                page-break-after: always;
              }
              .card, .chart-container, .stat-card {
                page-break-inside: avoid;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .footer {
                display: flex !important;
              }
              /* Các section React dùng class này để buộc ngắt trang A4 */
              .print-page-break {
                page-break-after: always;
                break-after: page;
              }
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div class="cover-title">BÁO CÁO THỐNG KÊ<br/>HỆ THỐNG</div>
            <div class="cover-subtitle">${reportType}</div>
            <div class="cover-meta">
              <div class="cover-meta-item"><strong>Năm học:</strong> ${academicYear}</div>
              <div class="cover-meta-item"><strong>Ngày xuất báo cáo:</strong> ${currentDate}</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <span class="footer-left">Báo cáo thống kê hệ thống</span>
            <span class="footer-center">${reportDate}</span>
            <span class="footer-right">Trang <span class="page-number"></span></span>
          </div>
          
          <!-- Content -->
          <div class="content">
            ${processedContent}
          </div>
          
          <!-- Conclusion Page -->
          <div class="conclusion-page">
            <div class="conclusion-title">KẾT LUẬN</div>
            <div class="conclusion-content">
              <div class="conclusion-section">
                <div class="conclusion-section-title">Tổng kết</div>
                <div class="conclusion-section-content">
                  ${analysis.conclusion}
                </div>
              </div>
              <div class="conclusion-section">
                <div class="conclusion-section-title">Định hướng cải thiện</div>
                <div class="conclusion-section-content">
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Tăng số lượng sự kiện và hoạt động để khuyến khích sự tham gia của người học.</li>
                    <li>Khuyến khích các lớp ít tham gia tích cực hơn thông qua các chương trình hỗ trợ và động viên.</li>
                    <li>Phân tích sâu hơn về nguyên nhân chênh lệch điểm số giữa các đơn vị để có biện pháp điều chỉnh phù hợp.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Update page numbers
            window.addEventListener('load', function() {
              const pages = document.querySelectorAll('.page-number');
              let pageNum = 1;
              pages.forEach(function(page) {
                page.textContent = pageNum++;
              });
            });
          </script>
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

