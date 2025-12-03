import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';
export class ModerationService extends ApiService{
async getAllReport(token,PageNumber,PageSize,search){
    let url = `${API_CONFIG.MODERATION.GET_ALL_REPORT}?PageNumber=${PageNumber}&PageSize=${PageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
}
async createReport(payload, token) {
    return this.post(API_CONFIG.MODERATION.CREATE_REPORT, payload, token);
  }
async getUserStat(token,PageNumber,PageSize,search){
let url = `${API_CONFIG.MODERATION.GET_USER_STAT}?PageNumber=${PageNumber}&PageSize=${PageSize}`;
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.get(url, token);
}
async createNotification(payload, token) {
    return this.post(API_CONFIG.MODERATION.CREATE_NOTIFICATION, payload, token);
  }
  async updateStatus(payload, token) {
    return this.put(API_CONFIG.MODERATION.UPDATE_STATUS, payload, token);
  }
}