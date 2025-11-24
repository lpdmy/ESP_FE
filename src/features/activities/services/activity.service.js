import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

class ActivityService extends ApiService {
   async getActivities({ pageNumber = 1, pageSize = 100, search } = {}, token) {
      const params = new URLSearchParams({
         pageNumber,
         pageSize,
      });

      if (search) {
         params.append('search', search);
      }

      const endpoint = `${API_CONFIG.ACTIVITY.LIST}?${params.toString()}`;
      return this.get(endpoint, token);
   }

   async getActivityById(id, token) {
      return this.get(API_CONFIG.ACTIVITY.DETAIL.replace('{id}', id), token);
   }
}

export const activityService = new ActivityService();

