import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

export class DashboardService extends ApiService {
  async getUserStatistics(token) {
    return this.get(API_CONFIG.USER.STATISTICS, token);
  }

  async getClassGroupDashboard(token, academicYearId = null) {
    let url = API_CONFIG.CLASS_GROUP.DASHBOARD;
    if (academicYearId) {
      url += `?academicYearId=${academicYearId}`;
    }
    return this.get(url, token);
  }

  async getActivitySummary(token) {
    // Reuse activities API with small page size to get totalCount
    const url = `${API_CONFIG.ACTIVITY.GET_ALL}?pageNumber=1&pageSize=1`;
    return this.get(url, token);
  }
}

export const dashboardService = new DashboardService();


