import * as XLSX from "xlsx";

/**
 * Color palette theo yêu cầu: Blue – Purple – Teal – Gray
 */
const CHART_COLORS = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  gray: "#6b7280",
  darkBlue: "#1e40af",
  darkPurple: "#6d28d9",
};

/**
 * Tạo Excel template với cấu trúc tốt cho charts
 */
export const createExcelTemplateWithCharts = (sheets, filename = "export") => {
  const wb = XLSX.utils.book_new();
  
  // Sheet hướng dẫn
  const instructionSheet = XLSX.utils.aoa_to_sheet([
    ["HƯỚNG DẪN TẠO CHART TRONG EXCEL"],
    [""],
    ["1. CHART TYPES CẦN TẠO:"],
    ["   - Column Chart: So sánh số lượng theo nhóm"],
    ["   - Pie/Donut Chart: Tỷ lệ phần trăm"],
    ["   - Line Chart: Xu hướng theo thời gian"],
    [""],
    ["2. CÁCH TẠO CHART:"],
    ["   a. Chọn dữ liệu trong sheet tương ứng"],
    ["   b. Insert > Chart > Chọn loại chart"],
    ["   c. Format chart với màu: Blue (#3b82f6), Purple (#8b5cf6), Teal (#14b8a6), Gray (#6b7280)"],
    ["   d. Thêm Title, Label %, Legend bên phải"],
    [""],
    ["3. DATA VALIDATION (DROPDOWN):"],
    ["   - Chọn cell cần dropdown"],
    ["   - Data > Data Validation > List"],
    ["   - Source: Chọn range hoặc nhập giá trị"],
    ["   - Default: '-- Please select --'"],
    ["   - Error Alert: Hiển thị cảnh báo khi để trống"],
    [""],
    ["4. STYLING:"],
    ["   - Header: Nền xanh đậm (#1e40af) hoặc tím đậm (#6d28d9), chữ trắng, in đậm"],
    ["   - Font: Inter hoặc Calibri"],
    ["   - Freeze header row: View > Freeze Panes"],
    ["   - Auto-fit column: Double-click column border"],
    ["   - Zebra rows: Conditional Formatting > New Rule > Use formula"],
    ["     Formula: =MOD(ROW(),2)=0"],
    [""],
  ]);
  
  XLSX.utils.book_append_sheet(wb, instructionSheet, "Hướng dẫn");
  
  // Tạo các sheet dữ liệu với format tốt hơn
  sheets.forEach((sheet, index) => {
    const ws = createFormattedSheet(sheet.data, sheet.name, index);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  // Sheet Chart Data (dữ liệu đã format sẵn cho charts)
  if (sheets.length > 0) {
    const chartDataSheet = createChartDataSheet(sheets);
    if (chartDataSheet) {
      XLSX.utils.book_append_sheet(wb, chartDataSheet, "Chart Data");
    }
  }
  
  XLSX.writeFile(wb, `${filename}.xlsx`, {
    bookType: "xlsx",
    bookSST: false,
    type: "binary"
  });
  
  return true;
};

/**
 * Tạo sheet với format tốt hơn
 */
const createFormattedSheet = (data, sheetName, index) => {
  if (!data || data.length === 0) {
    return XLSX.utils.aoa_to_sheet([["Không có dữ liệu"]]);
  }
  
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Column widths
  const maxWidth = 50;
  const minWidth = 12;
  const colWidths = [];
  
  const headers = Object.keys(data[0]);
  headers.forEach((header, idx) => {
    const maxLength = Math.max(
      header.length,
      ...data.map((row) => {
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
  
  // Freeze header row
  ws["!freeze"] = { x: 0, y: 1 };
  
  // Auto filter
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: 0, c: range.e.c }
    })
  };
  
  // Thêm row cho dropdown (nếu cần)
  // Note: XLSX không hỗ trợ data validation, cần làm thủ công trong Excel
  
  return ws;
};

/**
 * Tạo sheet Chart Data với dữ liệu đã format sẵn cho charts
 */
const createChartDataSheet = (sheets) => {
  const chartDataRows = [];
  
  // Column Chart Data
  chartDataRows.push(["COLUMN CHART DATA - So sánh số lượng theo nhóm"]);
  chartDataRows.push([]);
  
  sheets.forEach((sheet) => {
    if (sheet.data && sheet.data.length > 0) {
      const headers = Object.keys(sheet.data[0]);
      const numericHeaders = headers.filter(h => {
        const firstVal = sheet.data[0][h];
        return typeof firstVal === 'number';
      });
      
      if (numericHeaders.length > 0) {
        chartDataRows.push([`Sheet: ${sheet.name}`]);
        chartDataRows.push(["Category", ...numericHeaders]);
        
        sheet.data.slice(0, 10).forEach((row) => {
          const category = headers.find(h => typeof row[h] === 'string');
          if (category) {
            chartDataRows.push([
              row[category],
              ...numericHeaders.map(h => row[h] || 0)
            ]);
          }
        });
        chartDataRows.push([]);
      }
    }
  });
  
  // Pie Chart Data
  chartDataRows.push(["PIE CHART DATA - Tỷ lệ phần trăm"]);
  chartDataRows.push([]);
  
  sheets.forEach((sheet) => {
    if (sheet.data && sheet.data.length > 0) {
      const headers = Object.keys(sheet.data[0]);
      const categoryHeader = headers[0];
      const valueHeader = headers.find(h => {
        const firstVal = sheet.data[0][h];
        return typeof firstVal === 'number';
      });
      
      if (categoryHeader && valueHeader) {
        chartDataRows.push([`Sheet: ${sheet.name}`]);
        chartDataRows.push(["Category", "Value", "Percentage"]);
        
        const total = sheet.data.reduce((sum, row) => sum + (row[valueHeader] || 0), 0);
        sheet.data.forEach((row) => {
          const value = row[valueHeader] || 0;
          const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
          chartDataRows.push([
            row[categoryHeader] || '',
            value,
            `${percentage}%`
          ]);
        });
        chartDataRows.push([]);
      }
    }
  });
  
  // Line Chart Data
  chartDataRows.push(["LINE CHART DATA - Xu hướng theo thời gian"]);
  chartDataRows.push([]);
  
  sheets.forEach((sheet) => {
    if (sheet.name.includes("thời gian") || sheet.name.includes("tháng") || sheet.name.includes("timeline")) {
      chartDataRows.push([`Sheet: ${sheet.name}`]);
      chartDataRows.push(["Thời gian", "Giá trị"]);
      
      sheet.data.forEach((row) => {
        const timeHeader = Object.keys(row).find(k => 
          k.toLowerCase().includes('tháng') || 
          k.toLowerCase().includes('năm') ||
          k.toLowerCase().includes('date') ||
          k.toLowerCase().includes('time')
        );
        const valueHeader = Object.keys(row).find(k => {
          const val = row[k];
          return typeof val === 'number';
        });
        
        if (timeHeader && valueHeader) {
          chartDataRows.push([
            row[timeHeader] || '',
            row[valueHeader] || 0
          ]);
        }
      });
      chartDataRows.push([]);
    }
  });
  
  if (chartDataRows.length <= 3) {
    return null; // Không có dữ liệu chart
  }
  
  return XLSX.utils.aoa_to_sheet(chartDataRows);
};

/**
 * Tạo Excel với template tốt hơn
 */
export const exportStatisticsToExcelAdvanced = (statsData, academicYearName = "Tất cả", tabName = "overview") => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `ThongKe_${tabName}_${academicYearName}_${timestamp}`.replace(/[^a-z0-9]/gi, "_");
  
  const sheets = [];
  
  // Tạo sheets như cũ nhưng với format tốt hơn
  if (tabName === "overview" && statsData.dashboardStats) {
    const { dashboardStats } = statsData;
    
    sheets.push({
      name: "Tổng quan",
      data: [
        { "Chỉ số": "Tổng người dùng", "Giá trị": dashboardStats.userCounts?.totalUsers || 0 },
        { "Chỉ số": "Học sinh", "Giá trị": dashboardStats.userCounts?.students || 0 },
        { "Chỉ số": "Giáo viên", "Giá trị": dashboardStats.userCounts?.teachers || 0 },
        { "Chỉ số": "Admin", "Giá trị": dashboardStats.userCounts?.admins || 0 },
        { "Chỉ số": "Tổng lớp học", "Giá trị": dashboardStats.systemCounts?.totalClasses || 0 },
        { "Chỉ số": "Tổng năm học", "Giá trị": dashboardStats.systemCounts?.totalAcademicYears || 0 },
        { "Chỉ số": "Câu lạc bộ hoạt động", "Giá trị": dashboardStats.systemCounts?.activeClubs || 0 },
        { "Chỉ số": "Tổng sự kiện", "Giá trị": dashboardStats.activityCounts?.totalActivities || 0 },
        { "Chỉ số": "Đang diễn ra", "Giá trị": dashboardStats.activityCounts?.ongoing || 0 },
        { "Chỉ số": "Sắp tới", "Giá trị": dashboardStats.activityCounts?.upcoming || 0 },
        { "Chỉ số": "Đã kết thúc", "Giá trị": dashboardStats.activityCounts?.completed || 0 },
        { "Chỉ số": "Tổng điểm đã trao", "Giá trị": dashboardStats.totalPointsAwarded || 0 },
      ],
    });
    
    if (dashboardStats.topActiveClasses && dashboardStats.topActiveClasses.length > 0) {
      sheets.push({
        name: "Top lớp tích cực",
        data: dashboardStats.topActiveClasses.map((cls, index) => ({
          "Xếp hạng": index + 1,
          "Tên lớp": cls.classGroupName,
          "Số sự kiện": cls.activityCount,
          "Số người tham gia": cls.participantCount,
          "Tổng điểm": cls.totalPointsAwarded,
        })),
      });
    }
    
    if (dashboardStats.topActiveStudents && dashboardStats.topActiveStudents.length > 0) {
      sheets.push({
        name: "Top học sinh tích cực",
        data: dashboardStats.topActiveStudents.map((student, index) => ({
          "Xếp hạng": index + 1,
          "Họ tên": student.fullName,
          "Số sự kiện": student.activityCount,
          "Tổng điểm": student.totalPointsAwarded,
        })),
      });
    }
    
    if (dashboardStats.activityTimeline && dashboardStats.activityTimeline.length > 0) {
      sheets.push({
        name: "Hoạt động theo thời gian",
        data: dashboardStats.activityTimeline.map((item) => ({
          "Tháng/Năm": item.monthYear,
          "Số sự kiện": item.activityCount,
          "Số người tham gia": item.participantCount,
          "Điểm đã trao": item.pointsAwarded || 0,
        })),
      });
    }
  } else if (tabName === "activities" && statsData.activityOverview) {
    const { activityOverview } = statsData;
    
    sheets.push({
      name: "Tổng quan",
      data: [
        { "Chỉ số": "Tổng số sự kiện", "Giá trị": activityOverview.totalCreated },
        { "Chỉ số": "Đang diễn ra", "Giá trị": activityOverview.ongoing },
        { "Chỉ số": "Đã kết thúc", "Giá trị": activityOverview.completed },
        { "Chỉ số": "Đã hủy", "Giá trị": activityOverview.cancelled },
      ],
    });
    
    if (activityOverview.byType && activityOverview.byType.length > 0) {
      sheets.push({
        name: "Phân loại theo loại",
        data: activityOverview.byType.map((item) => ({
          "Loại sự kiện": item.type,
          "Số lượng": item.count,
          "Tổng người tham gia": item.totalParticipants,
          "Tỷ lệ (%)": activityOverview.totalCreated > 0 
            ? ((item.count / activityOverview.totalCreated) * 100).toFixed(2) 
            : 0,
        })),
      });
    }
    
    if (activityOverview.topActivitiesByParticipants && activityOverview.topActivitiesByParticipants.length > 0) {
      sheets.push({
        name: "Top sự kiện",
        data: activityOverview.topActivitiesByParticipants.map((activity, index) => ({
          "Xếp hạng": index + 1,
          "Tên sự kiện": activity.title,
          "Số người tham gia": activity.participantCount,
          "Ngày bắt đầu": activity.startDate ? new Date(activity.startDate).toLocaleDateString("vi-VN") : "N/A",
          "Ngày kết thúc": activity.endDate ? new Date(activity.endDate).toLocaleDateString("vi-VN") : "N/A",
        })),
      });
    }
    
    if (activityOverview.byAcademicYear && activityOverview.byAcademicYear.length > 0) {
      sheets.push({
        name: "Phân bổ theo năm học",
        data: activityOverview.byAcademicYear.map((item) => ({
          "Năm học": item.academicYearName,
          "Số sự kiện": item.activityCount,
          "Tổng người tham gia": item.totalParticipants,
        })),
      });
    }
  } else if (tabName === "academic-year" && statsData.academicYearStats) {
    const { academicYearStats } = statsData;
    
    sheets.push({
      name: "Tổng quan",
      data: [
        { "Chỉ số": "Tổng số lớp", "Giá trị": academicYearStats.totalClasses },
        { "Chỉ số": "Tổng số học sinh", "Giá trị": academicYearStats.totalStudents },
        { "Chỉ số": "Tổng số sự kiện", "Giá trị": academicYearStats.totalActivities },
        { "Chỉ số": "Câu lạc bộ hoạt động", "Giá trị": academicYearStats.activeClubs },
      ],
    });
    
    if (academicYearStats.monthlyActivities && academicYearStats.monthlyActivities.length > 0) {
      sheets.push({
        name: "Hoạt động theo tháng",
        data: academicYearStats.monthlyActivities.map((item) => ({
          "Tháng": item.monthName,
          "Số sự kiện": item.activityCount,
          "Số người tham gia": item.participantCount,
          "Tổng điểm": item.totalPointsAwarded,
        })),
      });
    }
    
    if (academicYearStats.topActiveClasses && academicYearStats.topActiveClasses.length > 0) {
      sheets.push({
        name: "Top lớp tích cực",
        data: academicYearStats.topActiveClasses.map((cls, index) => ({
          "Xếp hạng": index + 1,
          "Tên lớp": cls.classGroupName,
          "Số sự kiện": cls.activityCount,
          "Số người tham gia": cls.participantCount,
          "Tổng điểm": cls.totalPointsAwarded,
        })),
      });
    }
    
    if (academicYearStats.topActiveStudents && academicYearStats.topActiveStudents.length > 0) {
      sheets.push({
        name: "Top học sinh tích cực",
        data: academicYearStats.topActiveStudents.map((student, index) => ({
          "Xếp hạng": index + 1,
          "Họ tên": student.fullName,
          "Số sự kiện": student.activityCount,
          "Tổng điểm": student.totalPointsAwarded,
        })),
      });
    }
  } else if (tabName === "class-group" && statsData.classGroupStats) {
    const { classGroupStats } = statsData;
    
    sheets.push({
      name: "Tổng quan",
      data: [
        { "Chỉ số": "Số học sinh", "Giá trị": classGroupStats.totalStudents },
        { "Chỉ số": "Sự kiện đã tham gia", "Giá trị": classGroupStats.totalActivitiesParticipated },
        { "Chỉ số": "Tổng điểm", "Giá trị": classGroupStats.totalPointsAwarded },
        { "Chỉ số": "Điểm trung bình", "Giá trị": classGroupStats.averagePoints?.toFixed(2) },
        { "Chỉ số": "Tỷ lệ tham gia (%)", "Giá trị": classGroupStats.participationRate?.toFixed(2) },
        { "Chỉ số": "Số giải thưởng", "Giá trị": classGroupStats.totalRewardsWon },
        { "Chỉ số": "Xếp hạng trong năm học", "Giá trị": classGroupStats.rankingInAcademicYear || "N/A" },
      ],
    });
    
    if (classGroupStats.topRewardActivities && classGroupStats.topRewardActivities.length > 0) {
      sheets.push({
        name: "Top sự kiện đạt giải",
        data: classGroupStats.topRewardActivities.map((activity, index) => ({
          "Xếp hạng": index + 1,
          "Tên sự kiện": activity.activityTitle,
          "Giải thưởng": activity.rank || "N/A",
          "Điểm thưởng": activity.pointsAwarded,
          "Ngày kết thúc": activity.activityEndDate ? new Date(activity.activityEndDate).toLocaleDateString("vi-VN") : "N/A",
        })),
      });
    }
    
    if (classGroupStats.studentPointsDistribution && classGroupStats.studentPointsDistribution.length > 0) {
      sheets.push({
        name: "Phân bổ điểm học sinh",
        data: classGroupStats.studentPointsDistribution.map((student, index) => ({
          "Xếp hạng": index + 1,
          "Họ tên": student.fullName,
          "Tổng điểm": student.totalPoints,
          "Số sự kiện": student.activityCount,
        })),
      });
    }
  }
  
  if (sheets.length === 0) {
    throw new Error("Không có dữ liệu để xuất");
  }
  
  createExcelTemplateWithCharts(sheets, filename);
  return true;
};

