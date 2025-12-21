import ExcelJS from 'exceljs';
import { convertChartsToImages } from './chartExportUtils';

/**
 * Export statistics to Excel with chart images
 */
export const exportStatisticsToExcelWithCharts = async (
  statsData,
  academicYearName = "Tất cả",
  tabName = "overview",
  chartImages = []
) => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `ThongKe_${tabName}_${academicYearName}_${timestamp}`.replace(/[^a-z0-9]/gi, "_");
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EduSphere System';
  workbook.created = new Date();
  
  // Add instruction sheet
  const instructionSheet = workbook.addWorksheet('Hướng dẫn');
  instructionSheet.columns = [{ width: 80 }];
  instructionSheet.addRow(['HƯỚNG DẪN TẠO CHART TRONG EXCEL']);
  instructionSheet.addRow([]);
  instructionSheet.addRow(['1. CHART TYPES CẦN TẠO:']);
  instructionSheet.addRow(['   - Column Chart: So sánh số lượng theo nhóm']);
  instructionSheet.addRow(['   - Pie/Donut Chart: Tỷ lệ phần trăm']);
  instructionSheet.addRow(['   - Line Chart: Xu hướng theo thời gian']);
  instructionSheet.addRow([]);
  instructionSheet.addRow(['2. CÁCH TẠO CHART:']);
  instructionSheet.addRow(['   a. Chọn dữ liệu trong sheet tương ứng']);
  instructionSheet.addRow(['   b. Insert > Chart > Chọn loại chart']);
  instructionSheet.addRow(['   c. Format chart với màu: Blue (#3b82f6), Purple (#8b5cf6), Teal (#14b8a6), Gray (#6b7280)']);
  instructionSheet.addRow(['   d. Thêm Title, Label %, Legend bên phải']);
  instructionSheet.addRow([]);
  
  // Style header row
  instructionSheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF1e40af' } };
  
  // Prepare data sheets
  const sheets = prepareDataSheets(statsData, tabName);
  
  // Add data sheets with formatting
  sheets.forEach((sheetData, index) => {
    const worksheet = workbook.addWorksheet(sheetData.name);
    
    // Add header row
    const headers = Object.keys(sheetData.data[0] || {});
    worksheet.addRow(headers);
    
    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e40af' } // Dark blue
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add data rows
    sheetData.data.forEach((row, rowIndex) => {
      const dataRow = worksheet.addRow(Object.values(row));
      
      // Zebra rows
      if (rowIndex % 2 === 0) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' } // Light gray
        };
      }
      
      // Border for all cells
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      });
    });
    
    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 12), 50);
    });
    
    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Add chart image if available
    const chartImage = chartImages.find(img => img.title.includes(sheetData.name) || sheetData.name.includes(img.title));
    if (chartImage && chartImage.imageData) {
      try {
        // Convert base64 to buffer (browser compatible)
        const base64Data = chartImage.imageData.replace(/^data:image\/\w+;base64,/, '');
        // Convert base64 string to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Add image to worksheet
        const imageId = workbook.addImage({
          buffer: bytes,
          extension: 'png',
        });
        
        // Insert image after data (calculate position)
        const imageRow = sheetData.data.length + 3;
        worksheet.addImage(imageId, {
          tl: { col: 0, row: imageRow },
          ext: { width: 600, height: 400 }
        });
        
        // Add chart title
        worksheet.getCell(`A${imageRow}`).value = chartImage.title;
        worksheet.getCell(`A${imageRow}`).font = { bold: true, size: 14, color: { argb: 'FF1e40af' } };
      } catch (error) {
        console.error('Error adding chart image to Excel:', error);
      }
    }
  });
  
  // Add Chart Images sheet if we have charts
  if (chartImages.length > 0) {
    const chartSheet = workbook.addWorksheet('Chart Images');
    chartSheet.addRow(['BIỂU ĐỒ ĐÃ XUẤT']);
    chartSheet.addRow([]);
    chartSheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF1e40af' } };
    
    chartImages.forEach((chart, index) => {
      try {
        const base64Data = chart.imageData.replace(/^data:image\/\w+;base64,/, '');
        // Convert base64 string to Uint8Array (browser compatible)
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const imageId = workbook.addImage({
          buffer: bytes,
          extension: 'png',
        });
        
        const startRow = index * 25 + 3;
        chartSheet.addImage(imageId, {
          tl: { col: 0, row: startRow },
          ext: { width: 600, height: 400 }
        });
        
        chartSheet.getCell(`A${startRow}`).value = chart.title;
        chartSheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };
      } catch (error) {
        console.error('Error adding chart to Chart Images sheet:', error);
      }
    });
  }
  
  // Write file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
  
  return true;
};

/**
 * Prepare data sheets from stats data
 */
const prepareDataSheets = (statsData, tabName) => {
  const sheets = [];
  
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
  
  return sheets;
};

