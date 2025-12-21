import { useState, useCallback } from "react";
import { statisticsService } from "../services/statistics.service";
import { useToast } from "@/common/hooks/useToast";

export const useStatisticsApi = () => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const getActivityOverviewStatistics = useCallback(
    async (academicYearId = null) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsService.getActivityOverviewStatistics(
          token,
          academicYearId
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching activity overview statistics:", error);
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thống kê tổng quan sự kiện"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getActivityDetailStatistics = useCallback(
    async (activityId) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsService.getActivityDetailStatistics(
          token,
          activityId
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching activity detail statistics:", error);
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thống kê chi tiết sự kiện"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getAcademicYearStatistics = useCallback(
    async (academicYearId) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsService.getAcademicYearStatistics(
          token,
          academicYearId
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching academic year statistics:", error);
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thống kê năm học"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getClassGroupStatistics = useCallback(
    async (classGroupId, academicYearId = null) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsService.getClassGroupStatistics(
          token,
          classGroupId,
          academicYearId
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching class group statistics:", error);
        toast.error(
          error?.response?.data?.message || "Không thể tải thống kê lớp"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const getDashboardStatistics = useCallback(
    async (academicYearId = null) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await statisticsService.getDashboardStatistics(
          token,
          academicYearId
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        toast.error(
          error?.response?.data?.message || "Không thể tải thống kê dashboard"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    loading,
    getActivityOverviewStatistics,
    getActivityDetailStatistics,
    getAcademicYearStatistics,
    getClassGroupStatistics,
    getDashboardStatistics,
  };
};

