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
   * Cancel registration for an activity (user cancels their own registration)
   * @param {number} activityId - Activity ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async cancelRegistration(activityId, token) {
    // Đảm bảo activityId là number và convert sang string để replace vào URL
    const id = Number(activityId);
    if (isNaN(id) || id <= 0) {
      throw new Error('Activity ID không hợp lệ');
    }
    return this.delete(
      API_CONFIG.ACTIVITY_PARTICIPANT.CANCEL_REGISTRATION.replace('{activityId}', String(id)),
      token
    );
  }

  async registerGroup(payload, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.GROUP, payload, token);
  }

  async registerSport(payload, token) {
    return this.post(API_CONFIG.ACTIVITY_PARTICIPANT.SPORT, payload, token);
  }

  /**
   * Get sport rosters with pagination
   * @param {Object} params - Query parameters { activityId, sportId?, pageNumber, pageSize, search?, sortBy?, sortDescending? }
   * @param {string} token - Authentication token
   * @returns {Promise} Response with paginated sport rosters
   */
  async getSportRosters(params, token) {
    const queryParams = new URLSearchParams();
    queryParams.append('activityId', params.activityId);
    if (params.sportId) {
      queryParams.append('sportId', params.sportId);
    }
    queryParams.append('pageNumber', params.pageNumber || 1);
    queryParams.append('pageSize', params.pageSize || 10);
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortDescending !== undefined) {
      queryParams.append('sortDescending', params.sortDescending);
    }
    return this.get(`${API_CONFIG.ACTIVITY_PARTICIPANT.GET_SPORT_ROSTERS}?${queryParams.toString()}`, token);
  }
}

export const activityParticipantService = new ActivityParticipantService();

