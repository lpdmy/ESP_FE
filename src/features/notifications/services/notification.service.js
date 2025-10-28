import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class NotificationService extends ApiService {
  async getByUser(token) {
    return this.get(API_CONFIG.NOTIFICATION.GET_BY_USER, token);
  }

  async addNotification(notificationData, token) {
    return this.post(API_CONFIG.NOTIFICATION.ADD, notificationData, token);
  }

  async markAsRead(id, token) {
    return this.put(API_CONFIG.NOTIFICATION.MARK_AS_READ.replace('{id}', id), null, token);
  }

  async addTestNotification(token) {
    return this.post(API_CONFIG.NOTIFICATION.ADD_TEST, {}, token);
  }
}

export const notificationService = new NotificationService();
