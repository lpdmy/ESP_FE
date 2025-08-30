import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';

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

export const courseService = new CourseService();