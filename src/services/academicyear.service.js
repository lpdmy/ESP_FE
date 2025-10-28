import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

const api = new ApiService();

export const AcademicYearService = {
  async getAll(token) {
    return api.get(API_CONFIG.CLASS_GROUP.GET_ACADEMIC_YEARS, token);
  },

  async getCurrent(token) {
    const response = await this.getAll(token);
    const data = response?.data || response || [];
    return data.find(year => year.isCurrent) || data[0];
  }
};
