import { useEffect, useState } from "react";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { LoadingCard } from "@/common/components/ui/loading";
import { useStatisticsApi } from "@/features/admin/hooks/useStatisticsApi";
import { ClassGroupService } from "@/services/classgroup.service";
import { activityService } from "@/features/activities/services/activity.service";
import { Button } from "@/common/components/ui/button";
import { CustomSelect } from "@/common/components/ui/CustomSelect";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { useToast } from "@/common/hooks/useToast";
import { exportStatisticsToExcel, exportToPDF } from "@/utils/exportUtils";
import { convertChartsToImages, replaceChartsWithImages } from "@/utils/chartExportUtils";
import { exportStatisticsToExcelWithCharts } from "@/utils/excelWithCharts";

const COLORS = [
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#ef4444", // Red
  "#a855f7", // Purple
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

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
  const [activeTab, setActiveTab] = useState("overview"); // overview, activities, academic-year, class-group

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
      
      // Create a printable element ID
      const printId = `statistics-print-${activeTab}-${Date.now()}`;
      
      // Create a temporary div with the statistics content
      const printElement = document.createElement("div");
      printElement.id = printId;
      printElement.style.position = "absolute";
      printElement.style.left = "-9999px";
      printElement.style.width = "210mm"; // A4 width
      document.body.appendChild(printElement);
      
      // Get current tab content
      const currentContent = document.querySelector(`[data-tab="${activeTab}"]`);
      if (currentContent) {
        // Clone content to avoid modifying original
        const clonedContent = currentContent.cloneNode(true);
        
        // Convert charts to images
        try {
          const chartImages = await convertChartsToImages(clonedContent);
          if (chartImages.length > 0) {
            replaceChartsWithImages(clonedContent, chartImages);
          }
        } catch (chartError) {
          console.warn("Could not convert charts to images, using placeholders:", chartError);
          // Fallback to placeholders if conversion fails
          const charts = clonedContent.querySelectorAll('[class*="recharts"], svg');
          charts.forEach(chart => {
            const container = chart.closest('.h-80, [class*="CardContent"]');
            if (container) {
              const card = container.closest('[class*="Card"]');
              const title = card?.querySelector('[class*="CardTitle"]')?.textContent || 'Biểu đồ';
              container.innerHTML = `
                <div class="chart-container">
                  <div class="chart-title">${title}</div>
                  <div class="chart-placeholder">
                    <p style="font-size: 14px;">Biểu đồ sẽ được hiển thị trong file Excel</p>
                  </div>
                </div>
              `;
            }
          });
        }
        
        // Remove interactive elements
        const buttons = clonedContent.querySelectorAll('button, [role="button"]');
        buttons.forEach(btn => btn.remove());
        
        // Style cards for print with better formatting
        const cards = clonedContent.querySelectorAll('[class*="Card"]');
        cards.forEach(card => {
          // Skip if it's already a stat card
          if (!card.classList.contains('stat-card')) {
            card.className = 'card';
            card.style.cssText = `
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              background: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
              page-break-inside: avoid;
            `;
            
            // Style card titles
            const cardTitle = card.querySelector('[class*="CardTitle"], h3, h4');
            if (cardTitle) {
              cardTitle.className = 'card-title';
              cardTitle.style.cssText = `
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 18px;
                color: #1e40af;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
              `;
            }
          }
        });
        
        // Style stat cards - find grid containers first
        const grids = clonedContent.querySelectorAll('[class*="grid"]');
        grids.forEach(grid => {
          const gridItems = grid.querySelectorAll(':scope > div, :scope > [class*="Card"]');
          gridItems.forEach((item, index) => {
            // Check if it's a stat card (has large number)
            const hasLargeNumber = item.querySelector('[class*="text-2xl"], [class*="text-3xl"]');
            if (hasLargeNumber) {
              item.className = 'stat-card';
              item.style.cssText = `
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                page-break-inside: avoid;
              `;
              
              // Style the number
              const numberEl = item.querySelector('[class*="text-2xl"], [class*="text-3xl"]');
              if (numberEl) {
                numberEl.className = 'stat-value';
                numberEl.style.cssText = `
                  font-size: 32px;
                  font-weight: 800;
                  color: #1e40af;
                  margin-bottom: 6px;
                  line-height: 1.2;
                `;
              }
              
              // Style the label
              const labelEl = item.querySelector('[class*="text-sm"], [class*="text-gray"]');
              if (labelEl && labelEl.textContent && !labelEl.textContent.includes('|')) {
                labelEl.className = 'stat-label';
                labelEl.style.cssText = `
                  font-size: 13px;
                  color: #64748b;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                `;
              }
              
              // Style subvalue
              const subValueEl = item.querySelector('[class*="text-xs"], [class*="text-gray-500"]');
              if (subValueEl && subValueEl.textContent.includes('|')) {
                subValueEl.className = 'stat-subvalue';
                subValueEl.style.cssText = `
                  font-size: 12px;
                  color: #94a3b8;
                  margin-top: 8px;
                  font-weight: 500;
                `;
              }
            }
          });
        });
        
        // Style tables
        const tables = clonedContent.querySelectorAll('table');
        tables.forEach(table => {
          table.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            font-size: 12px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            page-break-inside: avoid;
          `;
          
          // Style table headers
          const headers = table.querySelectorAll('th');
          headers.forEach(th => {
            th.style.cssText = `
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              font-weight: 700;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 14px 16px;
              border: none;
              border-bottom: 2px solid #1e3a8a;
            `;
          });
          
          // Style table cells
          const cells = table.querySelectorAll('td');
          cells.forEach((td, index) => {
            const row = td.parentElement;
            const rowIndex = Array.from(row.parentElement.children).indexOf(row);
            td.style.cssText = `
              padding: 14px 16px;
              border: none;
              border-bottom: 1px solid #e2e8f0;
              background: ${rowIndex % 2 === 0 ? 'white' : '#f8fafc'};
            `;
          });
        });
        
        // Style list items (top lists)
        const listContainers = clonedContent.querySelectorAll('[class*="space-y"]');
        listContainers.forEach(container => {
          const items = container.querySelectorAll(':scope > div');
          items.forEach((item, index) => {
            if (item.querySelector('[class*="rounded-full"]') || item.querySelector('[class*="flex items-center"]')) {
              item.className = 'list-item';
              item.style.cssText = `
                padding: 14px 16px;
                margin-bottom: 8px;
                background: ${index % 2 === 0 ? '#f8fafc' : 'white'};
                border-radius: 8px;
                border-left: 4px solid ${index % 2 === 0 ? '#3b82f6' : '#f97316'};
                display: flex;
                align-items: center;
                justify-content: space-between;
                page-break-inside: avoid;
              `;
              
              // Style rank badge
              const rankBadge = item.querySelector('[class*="rounded-full"]');
              if (rankBadge) {
                rankBadge.className = 'rank-badge';
                rankBadge.style.cssText = `
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
                `;
              }
            }
          });
        });
        
        const exportDate = new Date().toLocaleDateString("vi-VN", { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        printElement.innerHTML = `
          <div class="report-header">
            <h1 class="report-title">Báo cáo thống kê hệ thống</h1>
            <div class="report-meta">Năm học: ${academicYearName}</div>
            <div class="report-meta">Ngày xuất: ${exportDate}</div>
          </div>
          ${clonedContent.innerHTML}
        `;
      } else {
        printElement.innerHTML = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #f97316;">Báo cáo thống kê - ${academicYearName}</h1>
            <p>Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</p>
            <p>Không có dữ liệu để xuất</p>
          </div>
        `;
      }
      
      // Wait a bit for content to render, then export
      setTimeout(() => {
        exportToPDF(printId, `ThongKe_${activeTab}_${academicYearName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}`);
        // Clean up after a delay
        setTimeout(() => {
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
        statsData = { dashboardStats };
      } else if (activeTab === "activities") {
        if (!activityOverview) {
          toast.showError("Chưa có dữ liệu để xuất");
          return;
        }
        statsData = { activityOverview };
      } else if (activeTab === "academic-year") {
        const academicYearStats = window.currentAcademicYearStats;
        if (!academicYearStats) {
          toast.showError("Chưa có dữ liệu để xuất. Vui lòng chọn năm học.");
          return;
        }
        statsData = { academicYearStats };
      } else if (activeTab === "class-group") {
        const classGroupStats = window.currentClassGroupStats;
        if (!classGroupStats) {
          toast.showError("Chưa có dữ liệu để xuất. Vui lòng chọn lớp.");
          return;
        }
        statsData = { classGroupStats };
      }
      
      // Convert charts to images
      const currentContent = document.querySelector(`[data-tab="${activeTab}"]`);
      let chartImages = [];
      
      if (currentContent) {
        try {
          chartImages = await convertChartsToImages(currentContent);
        } catch (chartError) {
          console.warn("Could not convert charts to images:", chartError);
        }
      }
      
      // Export with charts
      await exportStatisticsToExcelWithCharts(statsData, academicYearName, activeTab, chartImages);
      toast.showSuccess("Đã xuất file Excel thành công với biểu đồ!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.showError(error.message || "Không thể xuất Excel. Vui lòng thử lại.");
    }
  };

  return (
    <AdminPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
            <p className="text-gray-600 mt-1">
              Tổng quan và phân tích dữ liệu hoạt động - sự kiện
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
            className={`px-4 py-2 font-medium ${
              activeTab === "overview"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Tổng quan
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "activities"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("activities")}
          >
            Sự kiện
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "academic-year"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("academic-year")}
          >
            Năm học
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "class-group"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("class-group")}
          >
            Lớp học
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
              {activeTab === "academic-year" && (
                <AcademicYearTab 
                  selectedAcademicYear={selectedAcademicYear}
                  onExportExcel={(stats) => {
                    const academicYearName = selectedAcademicYear
                      ? academicYears.find((y) => y.id === selectedAcademicYear)?.name || "Tất cả"
                      : "Tất cả";
                    exportStatisticsToExcel({ academicYearStats: stats }, academicYearName, "academic-year");
                    toast.showSuccess("Đã xuất file Excel thành công!");
                  }}
                />
              )}
              {activeTab === "class-group" && (
                <ClassGroupTab 
                  selectedAcademicYear={selectedAcademicYear}
                  onExportExcel={(stats) => {
                    const academicYearName = selectedAcademicYear
                      ? academicYears.find((y) => y.id === selectedAcademicYear)?.name || "Tất cả"
                      : "Tất cả";
                    exportStatisticsToExcel({ classGroupStats: stats }, academicYearName, "class-group");
                    toast.showSuccess("Đã xuất file Excel thành công!");
                  }}
                />
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover-lift">
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
        {dashboardStats?.activityTimeline && dashboardStats.activityTimeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Hoạt động theo thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.activityTimeline}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="monthYear" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="activityCount"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                    name="Số sự kiện"
                  />
                  <Line
                    type="monotone"
                    dataKey="participantCount"
                    stroke="#3b82f6"
                    name="Số người tham gia"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Points by Academic Year */}
        {dashboardStats?.pointsByAcademicYear && dashboardStats.pointsByAcademicYear.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Điểm theo năm học
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats.pointsByAcademicYear}>
                  <XAxis dataKey="academicYearName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPoints" fill="#22c55e" name="Tổng điểm" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Classes */}
        {dashboardStats?.topActiveClasses && dashboardStats.topActiveClasses.length > 0 && (
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
                        <div className="font-medium">{cls.classGroupName}</div>
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
        {dashboardStats?.topActiveStudents && dashboardStats.topActiveStudents.length > 0 && (
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
  const { loading, getActivityDetailStatistics } = useStatisticsApi();
  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activityDetailStats, setActivityDetailStats] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedActivityId) {
      loadActivityDetailStats();
    } else {
      setActivityDetailStats(null);
    }
  }, [selectedActivityId]);

  const loadActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await activityService.getAllActivities(1, 1000, null, token);
      const items = response?.data?.items || [];
      setActivities(items);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const loadActivityDetailStats = async () => {
    try {
      const data = await getActivityDetailStatistics(selectedActivityId);
      setActivityDetailStats(data);
    } catch (error) {
      console.error("Error loading activity detail statistics:", error);
      setActivityDetailStats(null);
    }
  };

  if (!activityOverview) {
    return <div className="text-center text-gray-500 py-12">Chưa có dữ liệu</div>;
  }

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
        {/* By Type */}
        {activityOverview.byType && activityOverview.byType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Phân loại theo loại sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityOverview.byType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {activityOverview.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* By Academic Year */}
        {activityOverview.byAcademicYear && activityOverview.byAcademicYear.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo năm học</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityOverview.byAcademicYear}>
                  <XAxis dataKey="academicYearName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activityCount" fill="#f97316" name="Số sự kiện" />
                  <Bar dataKey="totalParticipants" fill="#3b82f6" name="Số người tham gia" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Activities */}
      {activityOverview.topActivitiesByParticipants &&
        activityOverview.topActivitiesByParticipants.length > 0 && (
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

      {/* Activity Detail Section */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-600" />
            Thống kê chi tiết theo sự kiện
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn sự kiện để xem thống kê chi tiết
            </label>
            <CustomSelect
              value={selectedActivityId ? selectedActivityId.toString() : ""}
              onValueChange={(value) => {
                if (value) {
                  setSelectedActivityId(parseInt(value));
                } else {
                  setSelectedActivityId(null);
                }
              }}
              placeholder="Chọn sự kiện"
              options={activities.map((activity) => ({
                value: activity.id.toString(),
                label: `${activity.title} (${activity.startDate ? new Date(activity.startDate).toLocaleDateString("vi-VN") : "N/A"})`,
              }))}
              className="w-full"
            />
          </div>

          {/* Activity Detail Statistics */}
          {loading ? (
            <LoadingCard text="Đang tải thống kê chi tiết..." />
          ) : activityDetailStats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {activityDetailStats.totalRegistered}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số đăng ký</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600">
                      {activityDetailStats.actualParticipants}
                    </div>
                    <div className="text-sm text-gray-600">Người tham gia thực tế</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {activityDetailStats.participationRate?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {activityDetailStats.totalRewardPoints?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tổng điểm thưởng</div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart: Registered vs Actual Participants */}
              {activityDetailStats.registeredVsActual && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biểu đồ: Đăng ký vs Tham gia thực tế</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Đăng ký",
                            value: activityDetailStats.totalRegistered,
                          },
                          {
                            name: "Tham gia thực tế",
                            value: activityDetailStats.actualParticipants,
                          },
                        ]}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#f97316" name="Số lượng" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : selectedActivityId ? (
            <div className="text-center text-gray-500 py-8">
              Không có dữ liệu thống kê cho sự kiện này
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// Academic Year Tab Component
function AcademicYearTab({ selectedAcademicYear, onExportExcel }) {
  const { loading, getAcademicYearStatistics } = useStatisticsApi();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (stats) {
      // Store stats for export
      window.currentAcademicYearStats = stats;
    }
  }, [stats]);

  const loadStats = async () => {
    try {
      const data = await getAcademicYearStatistics(selectedAcademicYear);
      setStats(data);
    } catch (error) {
      console.error("Error loading academic year statistics:", error);
    }
  };

  if (loading) {
    return <LoadingCard text="Đang tải thống kê năm học..." />;
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        Vui lòng chọn năm học để xem thống kê
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <div className="text-sm text-gray-600">Tổng số lớp</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Tổng số học sinh</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <div className="text-sm text-gray-600">Tổng số sự kiện</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.activeClubs}</div>
            <div className="text-sm text-gray-600">Câu lạc bộ hoạt động</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activities */}
      {stats.monthlyActivities && stats.monthlyActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động theo tháng</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyActivities}>
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activityCount" fill="#f97316" name="Số sự kiện" />
                <Bar dataKey="participantCount" fill="#3b82f6" name="Số người tham gia" />
                <Bar dataKey="totalPointsAwarded" fill="#22c55e" name="Tổng điểm" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Classes and Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.topActiveClasses && stats.topActiveClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top lớp tích cực nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topActiveClasses.map((cls, index) => (
                  <div
                    key={cls.classGroupId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{cls.classGroupName}</div>
                        <div className="text-sm text-gray-500">
                          {cls.activityCount} sự kiện
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

        {stats.topActiveStudents && stats.topActiveStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top học sinh tích cực nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topActiveStudents.map((student, index) => (
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

      {/* Comparison with Previous Year */}
      {stats.comparisonWithPreviousYear && (
        <Card>
          <CardHeader>
            <CardTitle>So sánh với năm học trước</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Số lớp</div>
                <div
                  className={`text-2xl font-bold ${
                    (stats.comparisonWithPreviousYear.classCountChangePercent || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.comparisonWithPreviousYear.classCountChangePercent?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Số học sinh</div>
                <div
                  className={`text-2xl font-bold ${
                    (stats.comparisonWithPreviousYear.studentCountChangePercent || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.comparisonWithPreviousYear.studentCountChangePercent?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Số sự kiện</div>
                <div
                  className={`text-2xl font-bold ${
                    (stats.comparisonWithPreviousYear.activityCountChangePercent || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.comparisonWithPreviousYear.activityCountChangePercent?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Số người tham gia</div>
                <div
                  className={`text-2xl font-bold ${
                    (stats.comparisonWithPreviousYear.participantCountChangePercent || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.comparisonWithPreviousYear.participantCountChangePercent?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Class Group Tab Component
function ClassGroupTab({ selectedAcademicYear, onExportExcel }) {
  const { loading, getClassGroupStatistics } = useStatisticsApi();
  const [classGroups, setClassGroups] = useState([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadClassGroups();
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedClassGroup) {
      loadStats();
    }
  }, [selectedClassGroup, selectedAcademicYear]);

  useEffect(() => {
    if (stats) {
      // Store stats for export
      window.currentClassGroupStats = stats;
    }
  }, [stats]);

  const loadClassGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await ClassGroupService.getAll(token);
      const data = response?.data?.items || [];
      const filtered = selectedAcademicYear
        ? data.filter((cg) => cg.academicYearId === selectedAcademicYear)
        : data;
      setClassGroups(filtered);
    } catch (error) {
      console.error("Error loading class groups:", error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getClassGroupStatistics(
        selectedClassGroup,
        selectedAcademicYear
      );
      setStats(data);
    } catch (error) {
      console.error("Error loading class group statistics:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chọn lớp để xem thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomSelect
            value={selectedClassGroup?.toString() || ""}
            onValueChange={(value) => {
              if (value) {
                setSelectedClassGroup(parseInt(value));
              } else {
                setSelectedClassGroup(null);
              }
            }}
            placeholder="Chọn lớp"
            options={classGroups.map((cg) => ({
              value: cg.id.toString(),
              label: cg.name,
            }))}
            className="w-full"
          />
        </CardContent>
      </Card>

      {loading ? (
        <LoadingCard text="Đang tải thống kê lớp..." />
      ) : stats ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Số học sinh</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.totalActivitiesParticipated}</div>
                <div className="text-sm text-gray-600">Sự kiện đã tham gia</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalPointsAwarded?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Tổng điểm</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.participationRate?.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking */}
          {stats.rankingInAcademicYear && (
            <Card>
              <CardHeader>
                <CardTitle>Xếp hạng lớp trong năm học</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-orange-600">
                    #{stats.rankingInAcademicYear}
                  </div>
                  <div className="text-gray-600 mt-2">
                    Trong tổng số {stats.totalClassesInAcademicYear} lớp
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Reward Activities */}
          {stats.topRewardActivities && stats.topRewardActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top sự kiện lớp đạt giải</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topRewardActivities.map((activity, index) => (
                    <div
                      key={activity.activityId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{activity.activityTitle}</div>
                          <div className="text-sm text-gray-500">
                            {activity.rank && `Giải ${activity.rank}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {activity.pointsAwarded?.toLocaleString()}
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
      ) : (
        <div className="text-center text-gray-500 py-12">
          Vui lòng chọn lớp để xem thống kê
        </div>
      )}
    </div>
  );
}

