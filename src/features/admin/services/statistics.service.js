import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

export class StatisticsService extends ApiService {
  /**
   * Lấy thống kê tổng quan về sự kiện
   * @param {string} token - Authentication token
   * @param {number|null} academicYearId - ID năm học (optional)
   * @returns {Promise}
   */
  async getActivityOverviewStatistics(token, academicYearId = null) {
    let url = API_CONFIG.STATISTICS.ACTIVITY_OVERVIEW;
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    return this.get(url, token);
  }

  /**
   * Lấy thống kê chi tiết của 1 sự kiện cụ thể
   * @param {string} token - Authentication token
   * @param {number} activityId - ID sự kiện
   * @returns {Promise}
   */
  async getActivityDetailStatistics(token, activityId) {
    const url = API_CONFIG.STATISTICS.ACTIVITY_DETAIL.replace(
      "{activityId}",
      activityId
    );
    return this.get(url, token);
  }

  /**
   * Lấy thống kê theo năm học
   * @param {string} token - Authentication token
   * @param {number} academicYearId - ID năm học
   * @returns {Promise}
   */
  async getAcademicYearStatistics(token, academicYearId) {
    const url = API_CONFIG.STATISTICS.ACADEMIC_YEAR.replace(
      "{academicYearId}",
      academicYearId
    );
    return this.get(url, token);
  }

  /**
   * Lấy thống kê theo lớp
   * @param {string} token - Authentication token
   * @param {number} classGroupId - ID lớp
   * @param {number|null} academicYearId - ID năm học (optional)
   * @returns {Promise}
   */
  async getClassGroupStatistics(token, classGroupId, academicYearId = null) {
    let url = API_CONFIG.STATISTICS.CLASS_GROUP.replace(
      "{classGroupId}",
      classGroupId
    );
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    return this.get(url, token);
  }

  /**
   * Lấy Dashboard tổng hợp cho Admin
   * @param {string} token - Authentication token
   * @param {number|null} academicYearId - ID năm học (optional)
   * @returns {Promise}
   */
  async getDashboardStatistics(token, academicYearId = null) {
    let url = API_CONFIG.STATISTICS.DASHBOARD;
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    return this.get(url, token);
  }
}

export const statisticsService = new StatisticsService();


