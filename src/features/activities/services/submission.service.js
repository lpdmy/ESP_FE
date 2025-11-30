import { ApiService } from '@/services/api.service'

class SubmissionService extends ApiService {
  async getSubmissionStatus(activityId, token) {
    return this.get(`/activities/${activityId}/submission-status`, token)
  }

  async createSubmission(activityId, data, token) {
    return this.post(`/activities/${activityId}/submissions`, data, token)
  }

  async getMySubmission(activityId, token) {
    return this.get(`/activities/${activityId}/submissions/my`, token)
  }
}

export const submissionService = new SubmissionService()


