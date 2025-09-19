import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

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

  async oneTimeLogin(token) {
    return this.get(API_CONFIG.AUTH.ONE_TIME_LOGIN + `?token=${token}`);
  }

  async changePasswordOtl(request) {
    return this.post(API_CONFIG.AUTH.CHANGE_PASSWORD_OTL, request);
  }

  async changePassword(request) {
    const token = localStorage.getItem('token');
    return this.post(API_CONFIG.AUTH.CHANGE_PASSWORD, request, token);
  }

  async forgotPassword(request) {
    return this.post(API_CONFIG.AUTH.FORGOT_PASSWORD, request);
  }

  async createUser(request) {
    return this.post(API_CONFIG.AUTH.CREATE_USER, request);
  }

  async test(token) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return this.get(API_CONFIG.AUTH.TEST, token);
  }
}

export const authService = new AuthService();