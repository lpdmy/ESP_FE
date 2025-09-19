import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';
export class ActivityService extends ApiService {
    async getAllActivities(pageNumber, pageSize, search, token) {
    return this.get(
      `${API_CONFIG.ACTIVITY.GET_ALL}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search || ''}`,
      token
    );
  }
  async getActivityById(id, token) {
    return this.get(API_CONFIG.ACTIVITY.GET_BY_ID.replace('{id}', id), token);
  }
}