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
async getSubmissionByAcitivty(token, id, Search = "",pageSize,pageNumber) {
  let url = `${API_CONFIG.SUBMISSION.GET_SUBMISSION_ACTIVITY}/${id}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  if (Search && Search.trim() !== "") {
    url += `&search=${encodeURIComponent(Search.trim())}`;
  }
  return this.get(url, token);
}
async getJuryAcitivty(token, Search = "",pageSize,pageNumber) {
  let url = `${API_CONFIG.JURY.JURY_ACTIVITY}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
  if (Search && Search.trim() !== "") {
    url += `&Search=${encodeURIComponent(Search.trim())}`;
  }
  return this.get(url, token);
}
async assignJury(token, payload) {
    return this.post(API_CONFIG.JURY.JURY_ASSIGN, payload, token);
  }
}