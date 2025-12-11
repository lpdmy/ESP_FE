import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class UserService extends ApiService {
  // async getAllUsers(token) {
  //   return this.get(API_CONFIG.USER.GET_ALL, token);
  // }

  async getAllUsers(pageNumber, pageSize, search, status, role, sortField, sortDirection, token) {
    let url = `${API_CONFIG.USER.GET_ALL}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search || ''}`;
    
    if (status !== null && status !== undefined) {
      url += `&status=${status}`;
    }
    
    if (role !== null && role !== undefined && role !== 'all') {
      // Convert role string to number
      const roleMap = { 'admin': 0, 'student': 4, 'teacher': 2 };
      const roleNumber = roleMap[role];
      if (roleNumber !== undefined) {
        url += `&role=${roleNumber}`;
      }
    }
    
    if (sortField && sortDirection) {
      url += `&sortField=${sortField}&sortDirection=${sortDirection}`;
    }
    
    return this.get(url, token);
  }

  async getUserById(id, token) {
    return this.get(API_CONFIG.USER.GET_BY_ID.replace('{id}', id), token);
  }

  async createUser(userData, token) {
    return this.post(API_CONFIG.AUTH.CREATE_USER, userData, token);
  }

  async updateUser(userData, token) {
    return this.put(API_CONFIG.USER.UPDATE, userData, token);
  }

  async deleteUser(id, token) {
    return this.delete(`${API_CONFIG.USER.DELETE}/${id}`, token);
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

  async getUserStatistics(token) {
    return this.get(API_CONFIG.USER.STATISTICS, token);
  }
}

export const userService = new UserService();