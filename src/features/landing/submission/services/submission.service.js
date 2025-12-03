import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";
export class SubmissionService extends ApiService {
    async getSubmissionByUser(token, Search = "", pageSize, pageNumber) {
    let url = `${API_CONFIG.SUBMISSION.GET_MY_SUBMISSION}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (Search && Search.trim() !== "") {
      url += `&search=${encodeURIComponent(Search.trim())}`;
    }
    return this.get(url, token);
  }
  async getSubmissionDetail(token,id) {
    let url = `${API_CONFIG.SUBMISSION.GET_SUBMISSION_DETAIL}/${id}`;
    return this.get(url, token);
  }
}