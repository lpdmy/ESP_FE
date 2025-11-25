import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class ActivityService extends ApiService {
  /**
   * Get all activities with pagination and search
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @param {string} search - Search query (optional)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with activities data
   */
  async getAllActivities(pageNumber = 1, pageSize = 10, search = null, token) {
    let endpoint = `${API_CONFIG.ACTIVITY.GET_ALL}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    return this.get(endpoint, token);
  }

  /**
   * Get activity by ID
   * @param {number|string} id - Activity ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with activity data
   */
  async getActivityById(id, token) {
    return this.get(
      API_CONFIG.ACTIVITY.GET_BY_ID.replace('{id}', id),
      token
    );
  }

  /**
   * Create a new activity
   * @param {Object} activityData - Activity data (CreateActivityDto)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with created activity
   */
  async createActivity(activityData, token) {
    return this.post(API_CONFIG.ACTIVITY.CREATE, activityData, token);
  }

  /**
   * Update an existing activity
   * @param {Object} activityData - Activity data (UpdateActivityDto) - must include id
   * @param {string} token - Authentication token
   * @returns {Promise} Response with updated activity
   */
  async updateActivity(activityData, token) {
    return this.put(API_CONFIG.ACTIVITY.UPDATE, activityData, token);
  }

  /**
   * Generate tournament schedule using AI
   * @param {number|string} activityId - Activity ID
   * @param {Object} scheduleRequest - Schedule request data (GenerateTournamentScheduleRequestDto)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with generated schedule
   */
  async generateTournamentSchedule(activityId, scheduleRequest, token) {
    const endpoint = API_CONFIG.ACTIVITY.GENERATE_TOURNAMENT_SCHEDULE.replace('{id}', activityId);
    return this.post(endpoint, scheduleRequest, token);
  }

  /**
   * Train schedule ML model
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async trainScheduleModel(token) {
    return this.post(API_CONFIG.ACTIVITY.TRAIN_SCHEDULE_MODEL, {}, token);
  }
}

export const activityService = new ActivityService();

