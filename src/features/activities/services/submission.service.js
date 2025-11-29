import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class SubmissionService extends ApiService {
  /**
   * Get my submission for a specific activity
   * @param {number|string} activityId - Activity ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with submission data
   */
  async getMySubmissionByActivityId(activityId, token) {
    return this.get(
      API_CONFIG.SUBMISSION.GET_MY_SUBMISSION_BY_ACTIVITY_ID.replace('{activityId}', activityId),
      token
    );
  }

  /**
   * Create a new submission
   * @param {Object} submissionData - Submission data (CreateSubmissionDto)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with created submission
   */
  async createSubmission(submissionData, token) {
    return this.post(API_CONFIG.SUBMISSION.CREATE, submissionData, token);
  }

  /**
   * Update an existing submission
   * @param {number|string} submissionId - Submission ID
   * @param {Object} submissionData - Submission data (UpdateSubmissionDto)
   * @param {string} token - Authentication token
   * @returns {Promise} Response with updated submission
   */
  async updateSubmission(submissionId, submissionData, token) {
    return this.put(
      API_CONFIG.SUBMISSION.UPDATE.replace('{id}', submissionId),
      submissionData,
      token
    );
  }

  /**
   * Get submission by ID
   * @param {number|string} submissionId - Submission ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response with submission data
   */
  async getSubmissionById(submissionId, token) {
    return this.get(
      API_CONFIG.SUBMISSION.GET_BY_ID.replace('{id}', submissionId),
      token
    );
  }

  /**
   * Delete a submission
   * @param {number|string} submissionId - Submission ID
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async deleteSubmission(submissionId, token) {
    return this.delete(
      API_CONFIG.SUBMISSION.DELETE.replace('{id}', submissionId),
      token
    );
  }
}

export const submissionService = new SubmissionService();

