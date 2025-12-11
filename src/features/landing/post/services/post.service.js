import { ApiService } from "@/services/api.service";
import { API_CONFIG } from "@/config/api.config";

export class PostService extends ApiService {
  async createPost(profileData, token) {
    return this.post(API_CONFIG.POST.CREATE_POST, profileData, token);
  }
  async getUserPost(token, sortOrder ) {
    return this.get(`${API_CONFIG.POST.USER_POST}?sortOrder=${sortOrder }`, token);
  }
  
  async getAllPosts(token) {
    return this.get(API_CONFIG.POST.GET_ALL_POSTS, token);
  }
  
  async getPostsByClassGroup(classGroupId, token) {
    const url = API_CONFIG.POST.GET_POSTS_BY_CLASS_GROUP.replace('{id}', classGroupId);
    return this.get(url, token);
  }
  
  async DeletePost(id, token) {
    const urlWithId = `${API_CONFIG.POST.DELETE_POST}?id=${id}`;
    return this.delete(urlWithId, token);
  }
  async UpdatePost(payload, token) {
   return this.put(API_CONFIG.POST.UPDATE_POST, payload, token);
  }
  async LikePost(payload, token) {
   return this.post(API_CONFIG.POST.LIKE_POST, payload, token);
  }
}
