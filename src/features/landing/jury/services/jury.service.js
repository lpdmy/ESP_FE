import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
export class JuryService extends ApiService {
  async createJury(token, payload) {
    return this.post(API_CONFIG.JURY.JURY_API, payload, token);
  }
  async getJuryByClubId(token, id, Search = "") {
    let url = `${API_CONFIG.JURY.JURY_API}/${id}`;
    if (Search && Search.trim() !== "") {
      url += `?search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async deleteJury(token, id) {
    let url = `${API_CONFIG.JURY.JURY_API}/${id}`;
    return this.delete(url, token);
  }
  async getSubmissionByAcitivty(token, id, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.SUBMISSION.GET_SUBMISSION_ACTIVITY}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async getJuryAcitivty(token, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.JURY.JURY_ACTIVITY}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&Search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async assignJury(token, payload) {
    return this.post(API_CONFIG.JURY.JURY_ASSIGN, payload, token);
  }
  async ramdomAssignJury(token, payload) {
    return this.post(API_CONFIG.JURY.RANDOM_ASSIGN, payload, token);
  }
  async deleteRandomAssign(token, id) {
    let url = `${API_CONFIG.JURY.DELETE_RANDOM_ASSIGN}/${id}`;
    return this.delete(url, token);
  }
  async getJuryAssign(token,id, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.JURY.GET_ASSIGN_USER}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&Search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async getJuryAssignNotGrade(token,id, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.JURY.GET_ASSIGN_USER_NOT_GRADE}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&Search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async getJuryAssignGrade(token,id, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.JURY.GET_ASSIGN_USER_GRADE}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&Search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async gradingSubmission(token, payload) {
    return this.post(API_CONFIG.JURY.GRADING, payload, token);
  }

  async isAssignedToGrade(token, userId, submissionId) {
    const url = `${API_CONFIG.JURY.IS_ASSIGNED}/${userId}/${submissionId}`;
    return this.get(url, token);
  }

  async RankByActivityId(token,id) {
    const url = API_CONFIG.ACTIVITY.RANK_BY_ID.replace("{id}", id);
    return this.get(url, token);
  }
  
  async getActivitiesWithoutJury(token) {
    return this.get(API_CONFIG.JURY.GET_ACTIVITIES_WITHOUT_JURY, token);
  }
  
  async improvedRandomAssign(token, payload) {
    return this.post(API_CONFIG.JURY.IMPROVED_RANDOM_ASSIGN, payload, token);
  }
}
