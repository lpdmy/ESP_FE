import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class UserService extends ApiService {
  async getAllUsers(token) {
    return this.get(API_CONFIG.USER.GET_ALL, token);
  }

  async getUserById(id, token) {
    return this.get(API_CONFIG.USER.GET_BY_ID.replace('{id}', id), token);
  }

  async createUser(userData, token) {
    return this.post(API_CONFIG.USER.CREATE, userData, token);
  }

  async updateUser(id, userData, token) {
    return this.put(API_CONFIG.USER.UPDATE.replace('{id}', id), userData, token);
  }

  async deleteUser(id, token) {
    return this.delete(API_CONFIG.USER.DELETE.replace('{id}', id), token);
  }
}

export const userService = new UserService();