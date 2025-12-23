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
      setReportData(null);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Báo cáo thống kê năm học
          </h1>
          <p className="text-base text-gray-600">
            Phân tích và xuất báo cáo thống kê điểm số, hoạt động theo năm học
          </p>
        </div>

        <div className="sticky top-4 z-10">
          <StatisticsFilterPanel
            onFilterChange={handleFilterChange}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            loading={loading}
          />
        </div>

        {selectedAcademicYear && (
          <QuickInsightCards
            overview={reportData?.overview}
            academicYear={selectedAcademicYear}
            loading={loading}
          />
        )}

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

