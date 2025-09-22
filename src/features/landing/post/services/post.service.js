import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class PostService extends ApiService{
    async createPost(profileData, token) {
    return this.post(API_CONFIG.POST.CREATE_POST, profileData, token);
  }
}