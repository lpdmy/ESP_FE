import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class WeeklyQuizService extends ApiService {
  /**
   * Tạo quiz mới (Teacher/Admin)
   */
  async createQuiz(data, token) {
    return this.post(API_CONFIG.WEEKLY_QUIZ.CREATE, data, token);
  }

  /**
   * Lấy quiz theo ID
   */
  async getQuizById(id, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.GET_BY_ID.replace('{id}', id);
    return this.get(endpoint, token);
  }

  /**
   * Lấy tất cả quiz active
   */
  async getAllQuizzes(token) {
    return this.get(API_CONFIG.WEEKLY_QUIZ.GET_ALL, token);
  }

  /**
   * Lấy quiz theo tuần và năm
   */
  async getQuizzesByWeekYear(weekNumber, year, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.GET_BY_WEEK_YEAR
      .replace('{weekNumber}', weekNumber)
      .replace('{year}', year);
    return this.get(endpoint, token);
  }

  /**
   * Lấy quiz của giáo viên (Teacher/Admin)
   */
  async getMyQuizzes(token) {
    return this.get(API_CONFIG.WEEKLY_QUIZ.GET_MY_QUIZZES, token);
  }

  /**
   * Cập nhật quiz (Teacher/Admin)
   */
  async updateQuiz(id, data, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.UPDATE.replace('{id}', id);
    return this.put(endpoint, data, token);
  }

  /**
   * Xóa quiz (Teacher/Admin)
   */
  async deleteQuiz(id, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.DELETE.replace('{id}', id);
    return this.delete(endpoint, token);
  }

  /**
   * Nộp bài quiz (Student)
   */
  async submitQuiz(data, token) {
    return this.post(API_CONFIG.WEEKLY_QUIZ.SUBMIT, data, token);
  }

  /**
   * Lấy kết quả làm bài của học sinh
   */
  async getMySubmission(quizId, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.GET_MY_SUBMISSION.replace('{quizId}', quizId);
    return this.get(endpoint, token);
  }

  /**
   * Kiểm tra đã làm quiz chưa
   */
  async checkSubmitted(quizId, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.CHECK_SUBMITTED.replace('{quizId}', quizId);
    return this.get(endpoint, token);
  }

  /**
   * Lấy danh sách kết quả của quiz (Teacher/Admin)
   */
  async getSubmissions(quizId, token) {
    const endpoint = API_CONFIG.WEEKLY_QUIZ.GET_SUBMISSIONS.replace('{quizId}', quizId);
    return this.get(endpoint, token);
  }

  /**
   * Lấy lịch sử làm quiz của học sinh
   */
  async getMySubmissions(token) {
    return this.get(API_CONFIG.WEEKLY_QUIZ.GET_MY_SUBMISSIONS, token);
  }
}

export const weeklyQuizService = new WeeklyQuizService();

