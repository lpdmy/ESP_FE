import { useState } from "react";
import AdminPageLayout from "@/features/admin/components/AdminPageLayout";
import { StatisticsFilterPanel } from "@/features/admin/components/StatisticsFilterPanel";
import { StatisticsPreview } from "@/features/admin/components/StatisticsPreview";
import { QuickInsightCards } from "@/features/admin/components/QuickInsightCards";
import { useStatisticsReportApi } from "@/features/admin/hooks/useStatisticsReportApi";

export default function StatisticsReportPage() {
  const { loading, getAcademicYearReport, exportAcademicYearReport } =
    useStatisticsReportApi();

  const [reportData, setReportData] = useState(null);
  const [requestConfig, setRequestConfig] = useState(null);
  const [chartImages, setChartImages] = useState({});
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  const handleFilterChange = async (request) => {
    try {
      setReportData(null); // Clear previous data while loading
      setSelectedAcademicYear(request.academicYear);
      const data = await getAcademicYearReport(request);
      setReportData(data);
      setRequestConfig(request);
    } catch (error) {
      console.error("Error loading report:", error);
      setReportData(null);
    }
  };

  const handleExportPDF = async (request) => {
    try {
      // Wait a bit for charts to render and export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Include chart images in request
      const requestWithCharts = {
        ...request,
        weeklyTrendChartImage: chartImages.weeklyTrendChart || null,
        classDistributionChartImage: chartImages.classDistributionChart || null,
        scoreConcentrationChartImage: chartImages.scoreConcentrationChart || null,
        participationChartImage: chartImages.participationChart || null,
      };
      await exportAcademicYearReport(requestWithCharts, "pdf");
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const handleExportExcel = async (request) => {
    try {
      await exportAcademicYearReport(request, "excel");
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  return (
    <AdminPageLayout>
      <div className="space-y-8 pb-8" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Báo cáo thống kê năm học
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Phân tích và xuất báo cáo thống kê điểm số, hoạt động theo năm học một cách trực quan và chi tiết
          </p>
        </div>

        {/* Sticky Control Bar */}
        <div className="sticky top-4 z-10">
          <StatisticsFilterPanel
            onFilterChange={handleFilterChange}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            loading={loading}
          />
        </div>

        {/* Quick Insight Cards - Show immediately when year is selected */}
        {selectedAcademicYear && (
          <QuickInsightCards
            overview={reportData?.overview}
            academicYear={selectedAcademicYear}
            loading={loading}
          />
        )}

        {/* Main Content - Statistics Preview */}
        <div className="transition-all duration-300 ease-in-out">
          <StatisticsPreview
            reportData={reportData}
            requestConfig={requestConfig}
            loading={loading}
            onChartImagesReady={setChartImages}
          />
        </div>
      </div>
    </AdminPageLayout>
  );
}

