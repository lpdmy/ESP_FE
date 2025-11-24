import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

class ActivityParticipantService extends ApiService {
  async register(payload, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.BASE, payload, token);
  }
}

export const activityParticipantService = new ActivityParticipantService();

