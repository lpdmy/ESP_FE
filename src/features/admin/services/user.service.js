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

  async createUpdateStudentProfile(userData, token) {
    return this.put(API_CONFIG.USER.STUDENT_PROFILE, userData, token);
  }

  // UserProfile methods
  async getMyProfile(token) {
    return this.get(API_CONFIG.USER_PROFILE.MY_PROFILE, token);
  }

  async getAllStudentProfiles(token) {
    return this.get(API_CONFIG.USER_PROFILE.ALL_PROFILES, token);
  }

  async getStudentProfileById(id, token) {
    return this.get(API_CONFIG.USER_PROFILE.PROFILE_BY_ID.replace('{id}', id), token);
  }

  async createStudentProfile(profileData, token) {
    return this.post(API_CONFIG.USER_PROFILE.CREATE_PROFILE, profileData, token);
  }

  async updateStudentProfile(id, profileData, token) {
    return this.put(API_CONFIG.USER_PROFILE.UPDATE_PROFILE.replace('{id}', id), profileData, token);
  }

  async deleteStudentProfile(id, token) {
    return this.delete(API_CONFIG.USER_PROFILE.DELETE_PROFILE.replace('{id}', id), token);
  }

  async checkProfileExists(id, token) {
    return this.get(API_CONFIG.USER_PROFILE.CHECK_PROFILE_EXISTS.replace('{id}', id), token);
  }

  async updateMyPersonalInfo(personalInfoData, token) {
    return this.put(API_CONFIG.USER_PROFILE.MY_PROFILE, personalInfoData, token);
  }
}

export const userService = new UserService();