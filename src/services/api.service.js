import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../config/api.config';

class ApiService {
   constructor() {
      this.baseURL = API_CONFIG.BASE_URL;
   }

   // Generic HTTP methods
   async get(endpoint, token = null) {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
         method: 'GET',
         headers: getAuthHeaders(token)
      });
      return handleApiResponse(response);
   }

   async post(endpoint, data, token = null) {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
         method: 'POST',
         headers: getAuthHeaders(token),
         body: JSON.stringify(data)
      });
      return handleApiResponse(response);
   }

   async put(endpoint, data, token = null) {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
         method: 'PUT',
         headers: getAuthHeaders(token),
         body: JSON.stringify(data)
      });
      return handleApiResponse(response);
   }

   async delete(endpoint, token = null) {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
         method: 'DELETE',
         headers: getAuthHeaders(token)
      });
      return handleApiResponse(response);
   }

   async uploadFile(endpoint, file, token = null) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
         method: 'POST',
         headers: {
            'Authorization': token ? `Bearer ${token}` : ''
         },
         body: formData
      });
      return handleApiResponse(response);
   }
}

// Auth Service
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
      return this.get(API_CONFIG.AUTH.TEST);
   }
}

// User Service (khi bạn thêm UserController)
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

// Course Service (khi bạn thêm CourseController)
export class CourseService extends ApiService {
   async getAllCourses(token) {
      return this.get(API_CONFIG.COURSE.GET_ALL, token);
   }

   async getCourseById(id, token) {
      return this.get(API_CONFIG.COURSE.GET_BY_ID.replace('{id}', id), token);
   }

   async createCourse(courseData, token) {
      return this.post(API_CONFIG.COURSE.CREATE, courseData, token);
   }

   async updateCourse(id, courseData, token) {
      return this.put(API_CONFIG.COURSE.UPDATE.replace('{id}', id), courseData, token);
   }

   async deleteCourse(id, token) {
      return this.delete(API_CONFIG.COURSE.DELETE.replace('{id}', id), token);
   }
}

// Export instances
export const authService = new AuthService();
export const userService = new UserService();
export const courseService = new CourseService();
export default ApiService;
