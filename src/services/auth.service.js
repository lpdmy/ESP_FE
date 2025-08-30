import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

export class AuthService extends ApiService {
  async login(credentials) {
    return this.post(API_CONFIG.AUTH.LOGIN, credentials);
  }

  async getMe(token) {
    return this.get(API_CONFIG.AUTH.GET_ME, token);
  }

  async importFile(file, token) {
    return this.uploadFile(API_CONFIG.AUTH.IMPORT_FILE, file, token);
  }

  async test() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return this.get(API_CONFIG.AUTH.TEST);
}
}

export const authService = new AuthService();