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
   * Lấy các giá trị nhập gần đây (theo user) để auto-fill
   * @param {string} token - Authentication token
   * @returns {Promise} Response with recent input values
   */
  async getRecentActivityInputs(token) {
    return this.get(API_CONFIG.ACTIVITY.RECENT_INPUTS, token);
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

  /**
   * Get activities that the current user has participated in
   * @param {number} pageNumber - Page number (default: 1)
   * @param {number} pageSize - Page size (default: 10)
   * @param {string} search - Search query (optional)
   * @param {string} status - Status filter: 'ongoing' or 'finished' (optional)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with activities data
   */
  async getMyActivities(pageNumber = 1, pageSize = 10, search = null, status = null, token) {
    let endpoint = `${API_CONFIG.ACTIVITY.MY_ACTIVITIES}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      endpoint += `&status=${encodeURIComponent(status)}`;
    }
    return this.get(endpoint, token);
  }

  /**
   * Get activity statistics (ongoing, upcoming, completed, total participants)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with activity statistics
   */
  async getActivityStatistics(token) {
    return this.get(API_CONFIG.ACTIVITY.STATISTICS, token);
  }

  /**
   * Get all activity templates
   * @param {string} token - Authentication token
   * @returns {Promise} Response with templates data
   */
  async getTemplates(token) {
    return this.get(API_CONFIG.ACTIVITY_TEMPLATE.GET_ALL, token);
  }

  /**
   * Get activity template by ID
   * @param {number|string} id - Template ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with template data
   */
  async getTemplateById(id, token) {
    return this.get(
      API_CONFIG.ACTIVITY_TEMPLATE.GET_BY_ID.replace('{id}', id),
      token
    );
  }

  /**
   * Get activity templates by SubType
   * @param {string} subType - SubType (SeminarWorkshop, CreativeContest, SportsFestival)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with templates data
   */
  async getTemplatesBySubType(subType, token) {
    const endpoint = `${API_CONFIG.ACTIVITY_TEMPLATE.GET_BY_SUBTYPE}?subType=${encodeURIComponent(subType)}`;
    return this.get(endpoint, token);
  }

  /**
   * Increment usage count for a template
   * @param {number|string} id - Template ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async incrementTemplateUsage(id, token) {
    return this.post(
      API_CONFIG.ACTIVITY_TEMPLATE.INCREMENT_USAGE.replace('{id}', id),
      {},
      token
    );
  }

  /**
   * Import activities from CSV/Excel file
   * @param {FormData} formData - FormData containing the file
   * @param {string} token - Authentication token
   * @returns {Promise} Response with validation result
   */
  async importActivities(formData, token) {
    return this.postFormData(API_CONFIG.ACTIVITY.IMPORT, formData, token);
  }

  /**
   * Bulk create activities
   * @param {Object} bulkCreateDto - BulkCreateActivitiesDto with activities array
   * @param {string} token - Authentication token
   * @returns {Promise} Response with created activities
   */
  async bulkCreateActivities(bulkCreateDto, token) {
    return this.post(API_CONFIG.ACTIVITY.BULK_CREATE, bulkCreateDto, token);
  }

  /**
   * Duplicate an activity
   * @param {number} activityId - Activity ID to duplicate
   * @param {string} token - Authentication token
   * @returns {Promise} Response with duplicated activity
   */
  async duplicateActivity(activityId, token) {
    return this.post(API_CONFIG.ACTIVITY.DUPLICATE.replace('{id}', activityId), {}, token);
  }

  // Activity Draft methods
  /**
   * Get all activity drafts for current user
   * @param {Object} filters - Filter parameters
   * @param {number} filters.pageNumber - Page number (default: 1)
   * @param {number} filters.pageSize - Page size (default: 10)
   * @param {string} filters.search - Search query (optional)
   * @param {string} filters.sortBy - Sort field (default: "UpdatedAt")
   * @param {boolean} filters.sortDescending - Sort descending (default: true)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with paginated drafts
   */
  async getDrafts(filters = {}, token) {
    const params = new URLSearchParams();
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending !== undefined) params.append('sortDescending', filters.sortDescending);
    return this.get(`${API_CONFIG.ACTIVITY_DRAFT.GET_ALL}?${params.toString()}`, token);
  }

  /**
   * Get activity draft by ID
   * @param {number} draftId - Draft ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with draft data
   */
  async getDraftById(draftId, token) {
    return this.get(API_CONFIG.ACTIVITY_DRAFT.GET_BY_ID.replace('{id}', draftId), token);
  }

  /**
   * Create activity draft
   * @param {Object} draftData - Draft data
   * @param {string} token - Authentication token
   * @returns {Promise} Response with created draft
   */
  async createDraft(draftData, token) {
    return this.post(API_CONFIG.ACTIVITY_DRAFT.CREATE, draftData, token);
  }

  /**
   * Update activity draft
   * @param {number} draftId - Draft ID
   * @param {Object} draftData - Draft data
   * @param {string} token - Authentication token
   * @returns {Promise} Response with updated draft
   */
  async updateDraft(draftId, draftData, token) {
    return this.put(API_CONFIG.ACTIVITY_DRAFT.UPDATE.replace('{id}', draftId), draftData, token);
  }

  /**
   * Delete activity draft
   * @param {number} draftId - Draft ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async deleteDraft(draftId, token) {
    return this.delete(API_CONFIG.ACTIVITY_DRAFT.DELETE.replace('{id}', draftId), token);
  }

  /**
   * Convert draft to activity
   * @param {number} draftId - Draft ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with created activity
   */
  async convertDraftToActivity(draftId, token) {
    return this.post(API_CONFIG.ACTIVITY_DRAFT.CONVERT_TO_ACTIVITY.replace('{id}', draftId), {}, token);
  }
}

export const activityService = new ActivityService();

