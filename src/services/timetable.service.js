import { ApiService } from './api.service';
import { API_CONFIG, handleApiResponse } from '@/config/api.config';

export class TimetableService extends ApiService {
  /**
   * Import timetable từ file (CSV/Excel)
   * @param {File} file - File thời khóa biểu
   * @param {number} academicYearId - ID niên khóa
   * @param {number|null} classGroupId - ID lớp (optional, nếu null thì import cho tất cả lớp trong niên khóa)
   * @param {boolean} replaceExisting - Có thay thế dữ liệu cũ không (default: true)
   * @param {string} token - Authentication token
   * @returns {Promise} Response với kết quả import
   */
  async importTimetable(file, academicYearId, classGroupId = null, replaceExisting = true, token) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicYearId', academicYearId.toString());
    if (classGroupId) {
      formData.append('classGroupId', classGroupId.toString());
    }
    formData.append('replaceExisting', replaceExisting.toString());

    const response = await fetch(`${this.baseURL}${API_CONFIG.TIMETABLE.IMPORT}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Không set Content-Type, browser sẽ tự động set với boundary cho FormData
      },
      body: formData
    });
    return handleApiResponse(response);
  }

  /**
   * Lấy thời khóa biểu theo lớp
   * @param {number} classGroupId - ID lớp
   * @param {string} token - Authentication token
   * @returns {Promise} Response với danh sách thời khóa biểu
   */
  async getTimetablesByClassGroup(classGroupId, token) {
    const endpoint = API_CONFIG.TIMETABLE.GET_BY_CLASS_GROUP.replace('{classGroupId}', classGroupId);
    return this.get(endpoint, token);
  }

  /**
   * Xóa thời khóa biểu theo lớp
   * @param {number} classGroupId - ID lớp
   * @param {string} token - Authentication token
   * @returns {Promise} Response
   */
  async deleteTimetablesByClassGroup(classGroupId, token) {
    const endpoint = API_CONFIG.TIMETABLE.DELETE_BY_CLASS_GROUP.replace('{classGroupId}', classGroupId);
    return this.delete(endpoint, token);
  }
}

export const timetableService = new TimetableService();

