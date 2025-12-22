import { useState, useCallback } from "react";
import { statisticsReportService } from "../services/statisticsReport.service";
import { useToast } from "@/common/hooks/useToast";

export const useStatisticsReportApi = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const getAcademicYearReport = useCallback(
    async (request) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsReportService.getAcademicYearReport(
          token,
          request
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching academic year report:", error);
        if (toast.showError) {
          toast.showError(
            error?.message ||
              "Không thể tải báo cáo thống kê năm học"
          );
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const exportAcademicYearReport = useCallback(
    async (request, format = "pdf") => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const { blob, filename } = await statisticsReportService.exportAcademicYearReport(
          token,
          request,
          format
        );
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        if (toast.showSuccess) {
          toast.showSuccess(`Xuất báo cáo ${format.toUpperCase()} thành công 🎉`);
        }
      } catch (error) {
        console.error("Error exporting report:", error);
        if (toast.showError) {
          toast.showError(
            error?.message || "Không thể xuất báo cáo"
          );
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    loading,
    getAcademicYearReport,
    exportAcademicYearReport,
  };
};

