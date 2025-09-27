import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

export class PostService extends ApiService {
  async createPost(profileData, token) {
    return this.post(API_CONFIG.POST.CREATE_POST, profileData, token);
  }
  async getUserPost(token, sortBy = "newest") {
    return this.get(`${API_CONFIG.POST.USER_POST}?sort=${sortBy}`, token);
  }
  async DeletePost(id, token) {
    const urlWithId = `${API_CONFIG.POST.DELETE_POST}?id=${id}`;
    return this.delete(urlWithId, token);
  }
  async UpdatePost(payload, token) {
   return this.put(API_CONFIG.POST.UPDATE_POST, payload, token);
  }
}
