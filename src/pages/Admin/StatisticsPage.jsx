import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { LoadingCard } from "@/common/components/ui/loading";
import { useStatisticsApi } from "@/features/admin/hooks/useStatisticsApi";
import { ClassGroupService } from "@/services/classgroup.service";
import { activityService } from "@/features/activities/services/activity.service";
import { Button } from "@/common/components/ui/button";
import { CustomSelect } from "@/common/components/ui/CustomSelect";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import {
  Activity,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Target,
} from "lucide-react";
import { useToast } from "@/common/hooks/useToast";
import { exportStatisticsToExcel, exportToPDF, exportStatisticsToPDFProfessional } from "@/utils/exportUtils";
import { convertEChartsToImages } from "@/utils/chartExportUtils";
import { exportStatisticsToExcelWithCharts } from "@/utils/excelWithCharts";
import { StatisticsPdfReport } from "@/features/admin/components/StatisticsPdfReport";
import { defaultStatisticsReportConfig } from "@/features/admin/config/statisticsReportConfig";

// ECharts theme colors - Theo palette từ hình ảnh
const ECHARTS_COLORS = [
  "#4A90E2", // Medium Blue (slice lớn nhất)
  "#7ED321", // Lime Green
  "#4A4A4A", // Dark Grey/Charcoal
  "#F5A623", // Medium Orange
  "#50E3C2", // Light Blue/Cyan
  "#F8E71C", // Bright Yellow
  "#BD10E0", // Pink/Magenta
  "#9013FE", // Purple
  "#B8E986", // Light Green (bổ sung)
  "#D0021B", // Red (bổ sung)
];

// Common ECharts text style for consistent font
const ECHARTS_TEXT_STYLE = {
  fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
  fontSize: 13,
  color: "#374151",
};

// Map activity SubType to Vietnamese label
const getActivityTypeLabel = (subType) => {
  const subTypeMap = {
    "SportsFestival": "Hội thao",
    "CreativeContest": "Cuộc thi sáng tạo",
    "SeminarWorkshop": "Hội thảo / Workshop",
    "Other": "Khác",
    "Unknown": "Không xác định",
  };
  return subTypeMap[subType] || subType || "Khác";
};

// Common ECharts title style
const ECHARTS_TITLE_STYLE = {
  textStyle: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    color: "#1F2937",
  },
};

export default function StatisticsPage() {
  const toast = useToast();
  const {
    loading,
    getActivityOverviewStatistics,
    getDashboardStatistics,
  } = useStatisticsApi();

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [activityOverview, setActivityOverview] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, activities, users, points, trends

  useEffect(() => {
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear || activeTab === "overview") {
      loadStatistics();
    }
  }, [selectedAcademicYear, activeTab]);

  const loadAcademicYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await ClassGroupService.getAcademicYears(token);
      const years = response?.data || [];
      setAcademicYears(years);
      const currentYear = years.find((y) => y.isCurrent);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
    }
  };

  const loadStatistics = async () => {
    try {
      const academicYearId = selectedAcademicYear || null;
      const [overview, dashboard] = await Promise.all([
        getActivityOverviewStatistics(academicYearId),
        getDashboardStatistics(academicYearId),
      ]);
      setActivityOverview(overview);
      setDashboardStats(dashboard);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.showInfo("Đang xử lý biểu đồ...");
      
      const academicYearName = selectedAcademicYear
        ? academicYears.find((y) => y.id === selectedAcademicYear)?.name || "Tất cả"
        : "Tất cả";
      
      const printId = `statistics-print-${activeTab}-${Date.now()}`;
      
      const printElement = document.createElement("div");
      printElement.id = printId;
      printElement.style.position = "absolute";
      printElement.style.top = "-9999px";
      printElement.style.left = "-9999px";
      printElement.style.width = "210mm";
      document.body.appendChild(printElement);
      
        const tabNames = {
          overview: "Tổng quan hệ thống",
          activities: "Thống kê hoạt động",
          users: "Thống kê người dùng",
          points: "Thống kê điểm thưởng",
          trends: "Phân tích xu hướng"
        };
        
        let statsDataForPDF = {};
        if (activeTab === "overview") {
          statsDataForPDF = { dashboardStats, activityOverview };
        } else if (activeTab === "activities") {
          statsDataForPDF = { activityOverview };
        } else if (activeTab === "users") {
          statsDataForPDF = { dashboardStats };
        } else if (activeTab === "points") {
          statsDataForPDF = { dashboardStats };
        } else if (activeTab === "trends") {
          statsDataForPDF = { dashboardStats, activityOverview };
        }
        
      // Convert ECharts hiện tại thành image để chèn vào layout PDF
      const currentContent = document.querySelector(`[data-tab="${activeTab}"]`);
      let chartImagesMap = {};
      if (currentContent) {
        try {
          const chartImages = await convertEChartsToImages(currentContent);
          chartImages.forEach((chart) => {
            const title = (chart.title || "").toLowerCase();
            if (title.includes("hoạt động theo thời gian") || title.includes("xu hướng")) {
              if (!chartImagesMap.activityTimeline) {
                chartImagesMap.activityTimeline = chart.imageData;
              }
            }
            if (title.includes("điểm theo năm học") || title.includes("phân bổ điểm theo năm học")) {
              if (!chartImagesMap.pointsByYear) {
                chartImagesMap.pointsByYear = chart.imageData;
              }
            }
          });
        } catch (chartError) {
          console.warn("Could not convert charts to images for PDF:", chartError);
        }
      }

      // Render layout PDF chuyên nghiệp bằng React vào container ẩn
      const root = ReactDOM.createRoot(printElement);
      const generatedAtLabel = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      root.render(
        <StatisticsPdfReport
          dashboardStats={dashboardStats}
          activityOverview={activityOverview}
          academicYearLabel={academicYearName}
          generatedAt={generatedAtLabel}
          reportConfig={{
            ...defaultStatisticsReportConfig,
            academicYear: academicYearName || defaultStatisticsReportConfig.academicYear,
          }}
          chartImages={chartImagesMap}
        />
      );

      setTimeout(() => {
        exportStatisticsToPDFProfessional(
          printId, 
          `BaoCaoThongKe_${activeTab}_${academicYearName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}`,
          {
            academicYear: academicYearName,
            reportType: tabNames[activeTab] || "Tổng quan",
            statsData: statsDataForPDF
          }
        );
        
        setTimeout(() => {
          root.unmount();
          if (printElement.parentNode) {
            printElement.parentNode.removeChild(printElement);
          }
        }, 2000);
      }, 500);
      
      toast.showSuccess("Đang mở cửa sổ in PDF...");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.showError("Không thể xuất PDF. Vui lòng thử lại.");
    }
  };

  const handleExportExcel = async () => {
    try {
      toast.showInfo("Đang xử lý biểu đồ...");
      
      const academicYearName = selectedAcademicYear
        ? academicYears.find((y) => y.id === selectedAcademicYear)?.name || "Tất cả"
        : "Tất cả";
      
      let statsData = {};
      
      if (activeTab === "overview") {
        if (!dashboardStats) {
          toast.showError("Chưa có dữ liệu để xuất");
          return;
        }
        statsData = { dashboardStats, activityOverview };
      } else if (activeTab === "activities") {
        if (!activityOverview) {
          toast.showError("Chưa có dữ liệu để xuất");
          return;
        }
        statsData = { activityOverview };
      } else if (activeTab === "users") {
        statsData = { dashboardStats };
      } else if (activeTab === "points") {
        statsData = { dashboardStats };
      } else if (activeTab === "trends") {
        statsData = { dashboardStats, activityOverview };
      }
      
      // Convert ECharts to images
      const currentContent = document.querySelector(`[data-tab="${activeTab}"]`);
      let chartImages = [];
      
      if (currentContent) {
        try {
          chartImages = await convertEChartsToImages(currentContent);
        } catch (chartError) {
          console.warn("Could not convert charts to images:", chartError);
        }
      }
      
      await exportStatisticsToExcelWithCharts(statsData, academicYearName, activeTab, chartImages);
      toast.showSuccess("Đã xuất file Excel thành công với biểu đồ!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.showError(error.message || "Không thể xuất Excel. Vui lòng thử lại.");
    }
  };

  const styleContentForPrint = (element) => {
    // Style cards
    const cards = element.querySelectorAll('[class*="Card"]');
    cards.forEach(card => {
      card.style.cssText = `
        border: 1px solid #e5e5e5;
        padding: 20px;
        margin-bottom: 20px;
        background: white;
        page-break-inside: avoid;
      `;
    });
    
    // Style stat cards
    const statCards = element.querySelectorAll('[class*="stat-card"]');
    statCards.forEach(card => {
      card.style.cssText = `
        background: #ffffff;
        border: 1px solid #e5e5e5;
        border-left: 3px solid #1e3a5f;
        padding: 20px;
        margin-bottom: 15px;
        page-break-inside: avoid;
      `;
    });
    
    // Style chart containers
    const chartContainers = element.querySelectorAll('.echarts-container, [class*="chart"]');
    chartContainers.forEach(container => {
      container.style.cssText = `
        margin-bottom: 25px;
        page-break-inside: avoid;
        background: #ffffff;
        border: 1px solid #e5e5e5;
        padding: 20px;
      `;
    });
  };

  return (
    <AdminPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
            <p className="text-gray-600 mt-1">
              Phân tích toàn diện dữ liệu hoạt động và hiệu suất hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <CustomSelect
              value={selectedAcademicYear ? selectedAcademicYear.toString() : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedAcademicYear(null);
                } else {
                  setSelectedAcademicYear(parseInt(value));
                }
              }}
              placeholder="Chọn năm học"
              options={[
                { value: "all", label: "Tất cả năm học" },
                ...academicYears.map((year) => ({
                  value: year.id.toString(),
                  label: year.name,
                })),
              ]}
              className="w-[200px]"
            />
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "overview"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 className="w-4 h-4" />
            Tổng quan
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "activities"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("activities")}
          >
            <Activity className="w-4 h-4" />
            Hoạt động
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "users"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4" />
            Người dùng
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "points"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("points")}
          >
            <Award className="w-4 h-4" />
            Điểm thưởng
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === "trends"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("trends")}
          >
            <TrendingUp className="w-4 h-4" />
            Xu hướng
          </button>
        </div>

        {loading ? (
          <LoadingCard text="Đang tải dữ liệu thống kê..." />
        ) : (
          <>
            <div data-tab={activeTab}>
              {activeTab === "overview" && (
                <OverviewTab dashboardStats={dashboardStats} activityOverview={activityOverview} />
              )}
              {activeTab === "activities" && (
                <ActivitiesTab activityOverview={activityOverview} />
              )}
              {activeTab === "users" && (
                <UsersTab dashboardStats={dashboardStats} />
              )}
              {activeTab === "points" && (
                <PointsTab dashboardStats={dashboardStats} selectedAcademicYear={selectedAcademicYear} />
              )}
              {activeTab === "trends" && (
                <TrendsTab dashboardStats={dashboardStats} activityOverview={activityOverview} />
              )}
            </div>
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}

// Overview Tab Component
function OverviewTab({ dashboardStats, activityOverview }) {
  const [classGroups, setClassGroups] = useState([]);

  useEffect(() => {
    const loadClassGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await ClassGroupService.list({ pageNumber: 1, pageSize: 1000 }, token);
        const data = response?.data?.items || [];
        setClassGroups(data);
      } catch (error) {
        console.error("Error loading class groups in OverviewTab:", error);
      }
    };
    loadClassGroups();
  }, []);

  // Format class name with grade: "10A1"
  const formatClassName = (classGroup) => {
    if (!classGroup) return "";
    const grade = classGroup.grade || "";
    const name = classGroup.name || "";
    return grade ? `${grade}${name}` : name;
  };

  if (!dashboardStats && !activityOverview) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

  const statsCards = dashboardStats
    ? [
        {
          title: "Tổng người dùng",
          value: dashboardStats.userCounts?.totalUsers || 0,
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          subValue: `HS: ${dashboardStats.userCounts?.students || 0} | GV: ${dashboardStats.userCounts?.teachers || 0}`,
        },
        {
          title: "Tổng lớp học",
          value: dashboardStats.systemCounts?.totalClasses || 0,
          icon: Activity,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          subValue: `${dashboardStats.systemCounts?.totalAcademicYears || 0} năm học`,
        },
        {
          title: "Tổng sự kiện",
          value: dashboardStats.activityCounts?.totalActivities || 0,
          icon: Calendar,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          subValue: `Đang diễn ra: ${dashboardStats.activityCounts?.ongoing || 0}`,
        },
        {
          title: "Tổng điểm đã trao",
          value: dashboardStats.totalPointsAwarded?.toLocaleString() || 0,
          icon: Award,
          color: "text-green-600",
          bgColor: "bg-green-50",
          subValue: "Trong hệ thống",
        },
      ]
    : [];

  // Activity Timeline Chart
  const activityTimelineOption = dashboardStats?.activityTimeline?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Hoạt động theo thời gian",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      textStyle: ECHARTS_TEXT_STYLE,
    },
    legend: {
      data: ["Số sự kiện", "Số người tham gia"],
      bottom: 0,
      textStyle: ECHARTS_TEXT_STYLE,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dashboardStats.activityTimeline.map((item) => item.monthYear),
      axisLabel: { 
        rotate: 45,
        ...ECHARTS_TEXT_STYLE,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Số sự kiện",
        position: "left",
        nameTextStyle: ECHARTS_TEXT_STYLE,
        axisLabel: ECHARTS_TEXT_STYLE,
      },
      {
        type: "value",
        name: "Số người tham gia",
        position: "right",
        nameTextStyle: ECHARTS_TEXT_STYLE,
        axisLabel: ECHARTS_TEXT_STYLE,
      },
    ],
    series: [
      {
        name: "Số sự kiện",
        type: "bar",
        data: dashboardStats.activityTimeline.map((item) => item.activityCount),
        itemStyle: { 
          color: ECHARTS_COLORS[0],
          borderRadius: [4, 4, 0, 0],
        },
        yAxisIndex: 0,
      },
      {
        name: "Số người tham gia",
        type: "line",
        data: dashboardStats.activityTimeline.map((item) => item.participantCount),
        itemStyle: { 
          color: ECHARTS_COLORS[1],
        },
        lineStyle: {
          width: 3,
          type: "solid",
        },
        symbol: "circle",
        symbolSize: 6,
        yAxisIndex: 1,
      },
    ],
  } : null;

  // Points by Academic Year Chart
  const pointsByYearOption = dashboardStats?.pointsByAcademicYear?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Điểm theo năm học",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${param.seriesName}: ${param.value.toLocaleString()} điểm`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dashboardStats.pointsByAcademicYear.map((item) => item.academicYearName),
      axisLabel: { 
        rotate: 45,
        ...ECHARTS_TEXT_STYLE,
      },
    },
    yAxis: {
      type: "value",
      name: "Tổng điểm",
      nameTextStyle: ECHARTS_TEXT_STYLE,
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Tổng điểm",
        type: "bar",
        data: dashboardStats.pointsByAcademicYear.map((item) => item.totalPoints),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ECHARTS_COLORS[2] },
            { offset: 1, color: ECHARTS_COLORS[2] + "CC" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => params.value.toLocaleString(),
          ...ECHARTS_TEXT_STYLE,
        },
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover-lift stat-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
              <div className="text-xs text-gray-500">{stat.subValue}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        {activityTimelineOption && (
          <Card>
            <CardContent className="p-6">
              <ReactECharts
                option={activityTimelineOption}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>
        )}

        {/* Points by Academic Year */}
        {pointsByYearOption && (
          <Card>
            <CardContent className="p-6">
              <ReactECharts
                option={pointsByYearOption}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Classes */}
        {dashboardStats?.topActiveClasses?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 lớp tích cực nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.topActiveClasses.map((cls, index) => (
                  <div
                    key={cls.classGroupId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {(() => {
                            // Tìm lớp trong classGroups để lấy grade
                            const fullClass = classGroups.find(cg => cg.id === cls.classGroupId);
                            return fullClass ? formatClassName(fullClass) : cls.classGroupName || `Lớp ${cls.classGroupId}`;
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cls.activityCount} sự kiện • {cls.participantCount} người tham gia
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {cls.totalPointsAwarded?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Students */}
        {dashboardStats?.topActiveStudents?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 học sinh tích cực nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.topActiveStudents.map((student, index) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {student.activityCount} sự kiện
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {student.totalPointsAwarded?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Activities Tab Component
function ActivitiesTab({ activityOverview }) {
  if (!activityOverview) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

  // Activity Status Pie Chart
  const activityStatusOption = {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Trạng thái sự kiện",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "item",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: ["Đang diễn ra", "Đã kết thúc", "Đã hủy"],
      textStyle: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Trạng thái",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          ...ECHARTS_TEXT_STYLE,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 600,
            ...ECHARTS_TEXT_STYLE,
          },
        },
        data: [
          {
            value: activityOverview.ongoing || 0,
            name: "Đang diễn ra",
            itemStyle: { color: ECHARTS_COLORS[0] },
          },
          {
            value: activityOverview.completed || 0,
            name: "Đã kết thúc",
            itemStyle: { color: ECHARTS_COLORS[2] },
          },
          {
            value: activityOverview.cancelled || 0,
            name: "Đã hủy",
            itemStyle: { color: ECHARTS_COLORS[3] },
          },
        ],
      },
    ],
  };

  // Activities by Type Chart
  const activitiesByTypeOption = activityOverview?.byType?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Phân loại theo loại sự kiện",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "item",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
      textStyle: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Loại sự kiện",
        type: "pie",
        radius: "60%",
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          ...ECHARTS_TEXT_STYLE,
        },
        data: activityOverview.byType.map((item, index) => ({
          value: item.count,
          name: getActivityTypeLabel(item.type), // Hiển thị tên tiếng Việt
          itemStyle: { color: ECHARTS_COLORS[index % ECHARTS_COLORS.length] },
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
          label: {
            ...ECHARTS_TEXT_STYLE,
            fontSize: 14,
            fontWeight: 600,
          },
        },
      },
    ],
  } : null;

  // Activities by Academic Year Chart
  const activitiesByYearOption = activityOverview?.byAcademicYear?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Phân bổ theo năm học",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      textStyle: ECHARTS_TEXT_STYLE,
    },
    legend: {
      data: ["Số sự kiện", "Số người tham gia"],
      bottom: 0,
      textStyle: ECHARTS_TEXT_STYLE,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: activityOverview.byAcademicYear.map((item) => item.academicYearName),
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    yAxis: {
      type: "value",
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Số sự kiện",
        type: "bar",
        data: activityOverview.byAcademicYear.map((item) => item.activityCount),
        itemStyle: { 
          color: ECHARTS_COLORS[1],
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "Số người tham gia",
        type: "bar",
        data: activityOverview.byAcademicYear.map((item) => item.totalParticipants),
        itemStyle: { 
          color: ECHARTS_COLORS[0],
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{activityOverview.totalCreated}</div>
            <div className="text-sm text-gray-600">Tổng số sự kiện</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{activityOverview.ongoing}</div>
            <div className="text-sm text-gray-600">Đang diễn ra</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{activityOverview.completed}</div>
            <div className="text-sm text-gray-600">Đã kết thúc</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{activityOverview.cancelled}</div>
            <div className="text-sm text-gray-600">Đã hủy</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Status */}
          <Card>
          <CardContent className="p-6">
            <ReactECharts
              option={activityStatusOption}
              style={{ height: "400px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
            </CardContent>
          </Card>

        {/* Activities by Type */}
        {activitiesByTypeOption && (
          <Card>
            <CardContent className="p-6">
              <ReactECharts
                option={activitiesByTypeOption}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activities by Academic Year */}
      {activitiesByYearOption && (
        <Card>
          <CardContent className="p-6">
            <ReactECharts
              option={activitiesByYearOption}
              style={{ height: "400px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Activities */}
      {activityOverview?.topActivitiesByParticipants?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top sự kiện có nhiều người tham gia nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityOverview.topActivitiesByParticipants.map((activity, index) => (
                  <div
                    key={activity.activityId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-gray-500">
                          {activity.startDate
                            ? new Date(activity.startDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {activity.participantCount}
                      </div>
                      <div className="text-xs text-gray-500">người tham gia</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

// Users Tab Component
function UsersTab({ dashboardStats }) {
  if (!dashboardStats) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

  // User Distribution Chart
  const userDistributionOption = dashboardStats?.userCounts ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Phân bổ người dùng",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "item",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Người dùng",
        type: "pie",
        radius: "60%",
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          ...ECHARTS_TEXT_STYLE,
        },
        data: [
          {
            value: dashboardStats.userCounts.students || 0,
            name: "Học sinh",
            itemStyle: { color: ECHARTS_COLORS[0] },
          },
          {
            value: dashboardStats.userCounts.teachers || 0,
            name: "Giáo viên",
            itemStyle: { color: ECHARTS_COLORS[1] },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
          label: {
            ...ECHARTS_TEXT_STYLE,
            fontSize: 14,
            fontWeight: 600,
          },
        },
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{dashboardStats.userCounts?.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">Tổng người dùng</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              {dashboardStats.userCounts?.students || 0}
            </div>
            <div className="text-sm text-gray-600">Học sinh</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600">
              {dashboardStats.userCounts?.teachers || 0}
            </div>
            <div className="text-sm text-gray-600">Giáo viên</div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution Chart */}
      {userDistributionOption && (
        <Card>
          <CardContent className="p-6">
            <ReactECharts
              option={userDistributionOption}
              style={{ height: "400px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Active Students */}
      {dashboardStats?.topActiveStudents?.length > 0 && (
          <Card>
            <CardHeader>
            <CardTitle>Top 10 học sinh tích cực nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
              {dashboardStats.topActiveStudents.map((student, index) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {student.activityCount} sự kiện
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {student.totalPointsAwarded?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Points Tab Component
function PointsTab({ dashboardStats, selectedAcademicYear }) {
  const { loading, getClassGroupStatistics } = useStatisticsApi();
  const [classGroups, setClassGroups] = useState([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState(null);
  const [classStats, setClassStats] = useState(null);
  const [isLoadingClassStats, setIsLoadingClassStats] = useState(false);
  const loadClassStatsTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const currentRequestRef = useRef(null); // Track current request để cancel nếu cần

  useEffect(() => {
    loadClassGroups();
  }, [selectedAcademicYear]);

  useEffect(() => {
    // Clear tất cả timeout và cancel request đang chờ
    if (loadClassStatsTimeoutRef.current) {
      clearTimeout(loadClassStatsTimeoutRef.current);
      loadClassStatsTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    // Cancel request đang chờ nếu có
    if (currentRequestRef.current) {
      currentRequestRef.current = null;
    }

    if (selectedClassGroup && !isLoadingClassStats) {
      // Debounce để tránh gọi API quá nhanh (có thể gây lỗi backend threading)
      loadClassStatsTimeoutRef.current = setTimeout(() => {
        loadClassStatistics();
      }, 500); // Tăng delay lên 500ms để đảm bảo không gọi quá nhanh
    } else if (!selectedClassGroup) {
      setClassStats(null);
    }

    // Cleanup timeout khi unmount hoặc dependencies thay đổi
    return () => {
      if (loadClassStatsTimeoutRef.current) {
        clearTimeout(loadClassStatsTimeoutRef.current);
        loadClassStatsTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassGroup, selectedAcademicYear]);

  const loadClassGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      
      console.log("Loading class groups, selectedAcademicYear:", selectedAcademicYear);
      
      // Load tất cả lớp hoặc filter theo năm học nếu có
      let response;
      if (selectedAcademicYear) {
        // Filter theo năm học
        const filterDto = {
          academicYearId: selectedAcademicYear,
          isDeleted: false,
        };
        console.log("Filtering classes with:", filterDto);
        response = await ClassGroupService.filter(filterDto, token);
      } else {
        console.log("Loading all classes");
        response = await ClassGroupService.list({ pageNumber: 1, pageSize: 1000 }, token);
      }
      
      console.log("Class groups response:", response);
      const data = response?.data?.items || response?.data || [];
      console.log("Class groups data:", data);
      setClassGroups(data);
    } catch (error) {
      console.error("Error loading class groups:", error);
      console.error("Error response:", error.response?.data);
      // Fallback: thử load tất cả lớp
      try {
        const token = localStorage.getItem("token");
        const response = await ClassGroupService.list({ pageNumber: 1, pageSize: 1000 }, token);
        const data = response?.data?.items || [];
        console.log("Fallback class groups:", data);
        setClassGroups(data);
      } catch (fallbackError) {
        console.error("Error loading class groups (fallback):", fallbackError);
        setClassGroups([]);
      }
    }
  };

  // Format class name with grade: "10A1"
  const formatClassName = (classGroup) => {
    if (!classGroup) return "";
    const grade = classGroup.grade || "";
    const name = classGroup.name || "";
    return grade ? `${grade}${name}` : name;
  };

  const loadClassStatistics = async (retryCount = 0) => {
    // Tránh gọi API nhiều lần cùng lúc (có thể gây lỗi DbContext threading ở backend)
    if (isLoadingClassStats) {
      console.log("Already loading class statistics, skipping...");
      return;
    }

    // Kiểm tra nếu selectedClassGroup không hợp lệ
    if (!selectedClassGroup) {
      setClassStats(null);
      return;
    }

    // Kiểm tra nếu đã có request khác đang chờ
    if (currentRequestRef.current) {
      console.log("Another request is pending, skipping...");
      return;
    }

    try {
      setIsLoadingClassStats(true);
      const requestId = Date.now();
      currentRequestRef.current = requestId;
      
      console.log("Loading class statistics for:", selectedClassGroup, "academicYear:", selectedAcademicYear);
      
      // Chỉ truyền academicYearId nếu nó khác với classGroupId (tránh nhầm lẫn)
      // Và chỉ khi thực sự cần filter theo năm học
      const academicYearIdToUse = selectedAcademicYear && selectedAcademicYear !== selectedClassGroup 
        ? selectedAcademicYear 
        : null;
      
      const data = await getClassGroupStatistics(selectedClassGroup, academicYearIdToUse);
      
      // Kiểm tra xem request này có còn hợp lệ không (có thể đã có request mới)
      if (currentRequestRef.current !== requestId) {
        console.log("Request is outdated, ignoring response");
        return;
      }
      
      console.log("Class statistics data:", data);
      setClassStats(data);
      currentRequestRef.current = null;
    } catch (error) {
      // Kiểm tra xem request này có còn hợp lệ không
      const requestId = currentRequestRef.current;
      if (!requestId) {
        console.log("Request was cancelled, ignoring error");
        return;
      }
      
      console.error("Error loading class statistics:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "";
      
      // Nếu là lỗi backend threading và chưa retry quá 1 lần, thử lại với delay
      if (errorMessage.includes("second operation") && retryCount < 1) {
        const delay = 2000; // Delay 2 giây để backend có thời gian xử lý
        console.log(`Retrying class statistics load (attempt ${retryCount + 1}/1) after ${delay}ms...`);
        setIsLoadingClassStats(false);
        currentRequestRef.current = null;
        
        // Clear timeout cũ nếu có
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          // Chỉ retry nếu vẫn còn selectedClassGroup
          if (selectedClassGroup) {
            loadClassStatistics(retryCount + 1);
          }
        }, delay);
        return;
      }
      
      console.error("Error details:", error.response?.data || error.message);
      setClassStats(null);
      currentRequestRef.current = null;
    } finally {
      setIsLoadingClassStats(false);
    }
  };

  if (!dashboardStats) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

  // Points Distribution Chart
  const pointsDistributionOption = dashboardStats?.pointsByAcademicYear?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Phân bổ điểm theo năm học",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${param.seriesName}: ${param.value.toLocaleString()} điểm`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dashboardStats.pointsByAcademicYear.map((item) => item.academicYearName),
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    yAxis: {
      type: "value",
      name: "Tổng điểm",
      nameTextStyle: ECHARTS_TEXT_STYLE,
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Tổng điểm",
        type: "bar",
        data: dashboardStats.pointsByAcademicYear.map((item) => item.totalPoints),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ECHARTS_COLORS[2] },
            { offset: 1, color: ECHARTS_COLORS[2] + "CC" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => params.value.toLocaleString(),
          ...ECHARTS_TEXT_STYLE,
        },
      },
    ],
  } : null;

  // Student Points Chart (if class selected)
  const studentPointsOption = classStats?.studentPointsDistribution?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: `Phân bổ điểm học sinh - ${formatClassName(classGroups.find(c => c.id === selectedClassGroup))}`,
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      textStyle: ECHARTS_TEXT_STYLE,
      formatter: (params) => {
        const param = params[0];
        return `${param.name}<br/>${param.seriesName}: ${param.value.toLocaleString()} điểm`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: classStats.studentPointsDistribution.map((item) => item.fullName),
      axisLabel: { 
        rotate: 45,
        ...ECHARTS_TEXT_STYLE,
      },
    },
    yAxis: {
      type: "value",
      name: "Tổng điểm",
      nameTextStyle: ECHARTS_TEXT_STYLE,
      axisLabel: ECHARTS_TEXT_STYLE,
    },
    series: [
      {
        name: "Tổng điểm",
        type: "bar",
        data: classStats.studentPointsDistribution.map((item) => item.totalPoints || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ECHARTS_COLORS[0] },
            { offset: 1, color: ECHARTS_COLORS[0] + "CC" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => params.value.toLocaleString(),
          ...ECHARTS_TEXT_STYLE,
        },
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {dashboardStats.totalPointsAwarded?.toLocaleString() || 0}
          </div>
          <div className="text-lg text-gray-600">Tổng điểm đã trao trong hệ thống</div>
        </CardContent>
      </Card>

      {/* Points Distribution Chart */}
      {pointsDistributionOption && (
        <Card>
          <CardContent className="p-6">
            <ReactECharts
              option={pointsDistributionOption}
              style={{ height: "400px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Class Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-600" />
            Thống kê điểm theo lớp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn lớp để xem thống kê điểm từng học sinh
            </label>
          <CustomSelect
            value={selectedClassGroup?.toString() || ""}
            onValueChange={(value) => {
              if (value) {
                setSelectedClassGroup(parseInt(value));
              } else {
                setSelectedClassGroup(null);
                  setClassStats(null);
              }
            }}
            placeholder="Chọn lớp"
            options={classGroups.map((cg) => ({
              value: cg.id.toString(),
              label: formatClassName(cg),
            }))}
            className="w-full"
          />
          </div>

          {/* Class Statistics */}
      {loading ? (
        <LoadingCard text="Đang tải thống kê lớp..." />
          ) : classStats ? (
        <div className="space-y-6">
              {/* Class Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {classStats.totalStudents || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số học sinh</div>
              </CardContent>
            </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600">
                      {classStats.totalPointsAwarded?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng điểm</div>
              </CardContent>
            </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {classStats.averagePoints?.toFixed(1) || 0}
                </div>
                    <div className="text-sm text-gray-600">Điểm trung bình</div>
              </CardContent>
            </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {classStats.totalActivitiesParticipated || 0}
                    </div>
                    <div className="text-sm text-gray-600">Sự kiện đã tham gia</div>
              </CardContent>
            </Card>
          </div>

              {/* Student Points Chart */}
              {studentPointsOption && (
                <Card>
                  <CardContent className="p-6">
                    <ReactECharts
                      option={studentPointsOption}
                      style={{ height: "400px", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Student Points Table */}
              {classStats?.studentPointsDistribution?.length > 0 && (
            <Card>
              <CardHeader>
                    <CardTitle>Bảng điểm từng học sinh</CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            <th className="px-4 py-3 text-left font-semibold">STT</th>
                            <th className="px-4 py-3 text-left font-semibold">Họ và tên</th>
                            <th className="px-4 py-3 text-center font-semibold">Tổng điểm</th>
                            <th className="px-4 py-3 text-center font-semibold">Số sự kiện</th>
                            <th className="px-4 py-3 text-center font-semibold">Điểm TB/sự kiện</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStats.studentPointsDistribution
                            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
                            .map((student, index) => {
                              const avgPointsPerActivity = student.activityCount > 0 
                                ? ((student.totalPoints || 0) / student.activityCount).toFixed(1)
                                : "0";
                              return (
                                <tr
                                  key={student.userId || index}
                                  className={`border-b hover:bg-gray-50 transition-colors ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                        index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-gray-100 text-gray-700" :
                                        index === 2 ? "bg-orange-100 text-orange-700" :
                                        "bg-blue-50 text-blue-600"
                                      }`}>
                                        {index + 1}
                                      </span>
                  </div>
                                  </td>
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {student.fullName}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="font-bold text-green-600 text-lg">
                                      {student.totalPoints?.toLocaleString() || 0}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {student.activityCount || 0}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-600">
                                    {avgPointsPerActivity}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                </div>
              </CardContent>
            </Card>
          )}
            </div>
          ) : selectedClassGroup ? (
            <div className="text-center text-gray-500 py-8">
              Không có dữ liệu thống kê cho lớp này
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Top Students of School */}
      {dashboardStats?.topActiveStudents?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top học sinh có điểm cao nhất của trường</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.topActiveStudents
                .sort((a, b) => (b.totalPointsAwarded || 0) - (a.totalPointsAwarded || 0))
                .slice(0, 20)
                .map((student, index) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-700"
                        style={{
                          backgroundColor: 
                            index === 0 ? "#FFED99" : // Yellow for rank 1
                            index === 1 ? "#E6E6E6" : // Grey for rank 2
                            index === 2 ? "#F9CC99" : // Orange for rank 3
                            "#ADD8E6" // Light blue for rank 4+
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {student.activityCount || 0} sự kiện
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="font-bold text-lg"
                        style={{
                          color: index === 0 ? "#4CAF50" : "#696969" // Green for rank 1, grey for others
                        }}
                      >
                        {student.totalPointsAwarded?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Classes by Points */}
      {dashboardStats?.topActiveClasses?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top lớp có điểm cao nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.topActiveClasses
                .sort((a, b) => (b.totalPointsAwarded || 0) - (a.totalPointsAwarded || 0))
                .slice(0, 10)
                .map((cls, index) => (
                  <div
                    key={cls.classGroupId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-700"
                        style={{
                          backgroundColor: 
                            index === 0 ? "#FFED99" : // Yellow for rank 1
                            index === 1 ? "#E6E6E6" : // Grey for rank 2
                            index === 2 ? "#F9CC99" : // Orange for rank 3
                            "#ADD8E6" // Light blue for rank 4+
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {(() => {
                            // Tìm lớp trong classGroups để lấy grade
                            const fullClass = classGroups.find(cg => cg.id === cls.classGroupId);
                            return fullClass ? formatClassName(fullClass) : cls.classGroupName;
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cls.activityCount || 0} sự kiện
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="font-bold text-lg"
                        style={{
                          color: index === 0 ? "#4CAF50" : "#696969" // Green for rank 1, grey for others
                        }}
                      >
                        {cls.totalPointsAwarded?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-500">điểm</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
  );
}

// Trends Tab Component
function TrendsTab({ dashboardStats, activityOverview }) {
  if (!dashboardStats && !activityOverview) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

  // Activity Timeline Trend
  const activityTrendOption = dashboardStats?.activityTimeline?.length > 0 ? {
    ...ECHARTS_TITLE_STYLE,
    title: {
      text: "Xu hướng hoạt động theo thời gian",
      left: "center",
      ...ECHARTS_TITLE_STYLE.textStyle,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      textStyle: ECHARTS_TEXT_STYLE,
    },
    legend: {
      data: ["Số sự kiện", "Số người tham gia"],
      bottom: 0,
      textStyle: ECHARTS_TEXT_STYLE,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dashboardStats.activityTimeline.map((item) => item.monthYear),
      axisLabel: { 
        rotate: 45,
        ...ECHARTS_TEXT_STYLE,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Số sự kiện",
        position: "left",
        nameTextStyle: ECHARTS_TEXT_STYLE,
        axisLabel: ECHARTS_TEXT_STYLE,
      },
      {
        type: "value",
        name: "Số người tham gia",
        position: "right",
        nameTextStyle: ECHARTS_TEXT_STYLE,
        axisLabel: ECHARTS_TEXT_STYLE,
      },
    ],
    series: [
      {
        name: "Số sự kiện",
        type: "line",
        smooth: true,
        data: dashboardStats.activityTimeline.map((item) => item.activityCount),
        itemStyle: { color: ECHARTS_COLORS[0] },
        lineStyle: {
          width: 3,
          type: "solid",
        },
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ECHARTS_COLORS[0] + "80" },
            { offset: 1, color: ECHARTS_COLORS[0] + "10" },
          ]),
        },
        yAxisIndex: 0,
      },
      {
        name: "Số người tham gia",
        type: "line",
        smooth: true,
        data: dashboardStats.activityTimeline.map((item) => item.participantCount),
        itemStyle: { color: ECHARTS_COLORS[1] },
        lineStyle: {
          width: 3,
          type: "solid",
        },
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ECHARTS_COLORS[1] + "80" },
            { offset: 1, color: ECHARTS_COLORS[1] + "10" },
          ]),
        },
        yAxisIndex: 1,
      },
    ],
  } : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Phân tích xu hướng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Phân tích xu hướng hoạt động và tham gia của người dùng theo thời gian để đưa ra các
            quyết định chiến lược.
          </p>
        </CardContent>
      </Card>

      {/* Activity Trend Chart */}
      {activityTrendOption && (
        <Card>
          <CardContent className="p-6">
            <ReactECharts
              option={activityTrendOption}
              style={{ height: "500px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {dashboardStats?.activityTimeline?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nhận định xu hướng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Xu hướng sự kiện</h4>
                <p className="text-sm text-blue-800">
                  {dashboardStats.activityTimeline.length > 0
                    ? `Trong ${dashboardStats.activityTimeline.length} tháng gần đây, hệ thống đã tổ chức ${dashboardStats.activityTimeline.reduce(
                        (sum, item) => sum + item.activityCount,
                        0
                      )} sự kiện.`
                    : "Chưa có dữ liệu đủ để phân tích xu hướng."}
                </p>
        </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Xu hướng tham gia</h4>
                <p className="text-sm text-green-800">
                  {dashboardStats.activityTimeline.length > 0
                    ? `Tổng số người tham gia: ${dashboardStats.activityTimeline.reduce(
                        (sum, item) => sum + item.participantCount,
                        0
                      ).toLocaleString()} người.`
                    : "Chưa có dữ liệu đủ để phân tích xu hướng."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
