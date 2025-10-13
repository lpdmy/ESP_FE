import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class StudentImportService extends ApiService {
  /**
   * Import students from CSV data
   * @param {Object} importData - Import data with students and options
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - Import result
   */
  async importStudents(importData, token) {
    return this.post(API_CONFIG.STUDENT_IMPORT.IMPORT_STUDENTS, importData, token);
  }

  /**
   * Validate students data before import
   * @param {Object} validationData - Data to validate
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - Validation result
   */
  async validateStudents(validationData, token) {
    return this.post(API_CONFIG.STUDENT_IMPORT.VALIDATE_STUDENTS, validationData, token);
  }

  /**
   * Download CSV template
   * @param {string} token - Authentication token
   * @returns {Promise<Blob>} - Template file
   */
  async downloadTemplate(token) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.STUDENT_IMPORT.DOWNLOAD_TEMPLATE}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  /**
   * Import students with progress tracking
   * @param {Object} importData - Import data
   * @param {string} token - Authentication token
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Import result
   */
  async importStudentsWithProgress(importData, token, onProgress) {
    try {
      // Import the data directly (backend sẽ xử lý validation từng hàng)
      onProgress && onProgress(30, 'Đang import dữ liệu...');
      const importResult = await this.importStudents(importData, token);
      
      onProgress && onProgress(100, 'Hoàn thành!');
      
      return importResult;
    } catch (error) {
      onProgress && onProgress(0, 'Có lỗi xảy ra: ' + error.message);
      throw error;
    }
  }
}

export const studentImportService = new StudentImportService();
