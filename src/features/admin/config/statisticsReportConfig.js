// statisticsReportConfig.js
// Cấu hình mặc định cho báo cáo thống kê hệ thống (PDF/Excel).
// Không chứa logic, chỉ là nơi khai báo brand & tuỳ chọn hiển thị.

export const defaultStatisticsReportConfig = {
  logoUrl: "", // Có thể gán URL logo trường / Sở nếu cần
  schoolName: "EduSphere Platform",
  academicYear: "", // Sẽ được override bằng năm học đang chọn nếu không rỗng
  systemVersion:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_VERSION) ||
    "v1.0",
  // Cấu hình hành vi báo cáo
  showCharts: true,
  chartColorScheme: "default", // "default" | "vibrant" | "mono"
  includeAllClasses: true,
  includeTopStudents: true,
  includeNotes: true,
  chartHeight: 230, // px
  pageOrientation: "portrait", // "portrait" | "landscape"
};


