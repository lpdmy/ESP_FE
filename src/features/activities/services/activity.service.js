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
   * Get optimized list of activities for list view with filtering and pagination
   * @param {Object} filters - Filter parameters
   * @param {number} filters.pageNumber - Page number (default: 1)
   * @param {number} filters.pageSize - Page size (default: 30)
   * @param {string} filters.search - Search query (optional)
   * @param {string} filters.subType - SubType filter: "all", "SeminarWorkshop", "CreativeContest", "SportsFestival" (optional)
   * @param {string} filters.dateFrom - Start date filter (YYYY-MM-DD format, optional)
   * @param {string} filters.dateTo - End date filter (YYYY-MM-DD format, optional)
   * @param {string} filters.organizer - Organizer filter (optional)
   * @param {number} filters.minParticipants - Minimum participants filter (optional)
   * @param {number} filters.maxParticipants - Maximum participants filter (optional)
   * @param {string} filters.sortBy - Sort field: "StartDate", "CreatedAt", "Title" (default: "StartDate")
   * @param {string} filters.sortOrder - Sort order: "ASC", "DESC" (default: "DESC")
   * @param {string} token - Authentication token
   * @returns {Promise} Response with paginated activities list items
   */
  async getListItems(filters = {}, token) {
    const params = new URLSearchParams();

    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    if (filters.search) params.append('search', filters.search);
    if (filters.subType && filters.subType !== 'all') params.append('subType', filters.subType);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.organizer) params.append('organizer', filters.organizer);
    if (filters.minParticipants !== undefined && filters.minParticipants !== null) {
      params.append('minParticipants', filters.minParticipants);
    }
    if (filters.maxParticipants !== undefined && filters.maxParticipants !== null) {
      params.append('maxParticipants', filters.maxParticipants);
    }
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending !== undefined) params.append('sortDescending', filters.sortDescending);

    const endpoint = `${API_CONFIG.ACTIVITY.GET_LIST_ITEMS}${params.toString() ? `?${params.toString()}` : ''}`;
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
   * Soft delete an activity (set isDeleted = true)
   * @param {number|string} id - Activity ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async deleteActivity(id, token) {
    const endpoint = API_CONFIG.ACTIVITY.DELETE.replace('{id}', id);
    return this.delete(endpoint, token);
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
   * Apply tournament schedule after manual adjustments
   * @param {number|string} activityId - Activity ID
   * @param {Object} applyRequest - ApplyTournamentScheduleRequestDto
   * @param {string} token - Authentication token
   * @returns {Promise} Response with apply result
   */
  async applyTournamentSchedule(activityId, applyRequest, token) {
    const endpoint = API_CONFIG.ACTIVITY.APPLY_TOURNAMENT_SCHEDULE.replace('{id}', activityId);
    return this.post(endpoint, applyRequest, token);
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

