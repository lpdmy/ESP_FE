import { executeApiCall } from '../utils/apiUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000';

export const systemAnnouncementService = {
   // Admin APIs
   async getAllAnnouncements(paginationParams = {}) {
      const params = new URLSearchParams({
         pageNumber: paginationParams.pageNumber || 1,
         pageSize: paginationParams.pageSize || 10,
         search: paginationParams.search || '',
         sortBy: paginationParams.sortBy || 'CreatedAt',
         sortDescending: paginationParams.sortDescending || true,
      });

      return executeApiCall(`/api/systemannouncement?${params}`, {
         method: 'GET',
         requiresAuth: true,
         requiredRole: 'Admin'
      });
   },

   async getAnnouncementById(id) {
      return executeApiCall(`/api/systemannouncement/${id}`, {
         method: 'GET',
         requiresAuth: true,
         requiredRole: 'Admin'
      });
   },

   async createAnnouncement(formData) {
      return executeApiCall('/api/systemannouncement', {
         method: 'POST',
         body: formData,
         requiresAuth: true,
         requiredRole: 'Admin',
         isFormData: true
      });
   },

   async updateAnnouncement(formData) {
      return executeApiCall('/api/systemannouncement', {
         method: 'PUT',
         body: formData,
         requiresAuth: true,
         requiredRole: 'Admin',
         isFormData: true
      });
   },

   async deleteAnnouncement(id) {
      return executeApiCall(`/api/systemannouncement/${id}`, {
         method: 'DELETE',
         requiresAuth: true,
         requiredRole: 'Admin'
      });
   },

   async toggleVisibility(id) {
      return executeApiCall(`/api/systemannouncement/${id}/toggle-visibility`, {
         method: 'PUT',
         requiresAuth: true,
         requiredRole: 'Admin'
      });
   },

   // User APIs
   async getPublicAnnouncements() {
      return executeApiCall('/api/systemannouncement/public', {
         method: 'GET',
         requiresAuth: true,
         requiredRole: 'Student,Teacher,Admin'
      });
   },

   async markAsViewed(id) {
      return executeApiCall(`/api/systemannouncement/${id}/mark-viewed`, {
         method: 'POST',
         requiresAuth: true,
         requiredRole: 'Student,Teacher,Admin'
      });
   }
};
