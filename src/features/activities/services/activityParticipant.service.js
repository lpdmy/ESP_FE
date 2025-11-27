import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class ActivityParticipantService extends ApiService {
  /**
   * Register for an activity
   * @param {Object} participantData - Participant data { activityId, reason? }
   * @param {string} token - Authentication token
   * @returns {Promise} Response with participant data
   */
  async registerForActivity(participantData, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.ADD, participantData, token);
  }

  /**
   * Cancel registration for an activity
   * @param {number} participationId - Participation ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async cancelRegistration(participationId, token) {
    return this.delete(
      `${API_CONFIG.ACTIVITY_PARTICIPANT.REMOVE}?participationId=${participationId}`,
      token
    );
  }

  async registerGroup(payload, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.GROUP, payload, token);
  }

  async registerSport(payload, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.SPORT, payload, token);
  }
}

export const activityParticipantService = new ActivityParticipantService();

