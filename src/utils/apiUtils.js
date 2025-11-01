import { API_CONFIG } from '@/config/api.config';
import { toast } from 'react-toastify';

const API_BASE_URL = API_CONFIG.BASE_HUB_URL || 'https://localhost:7084';

// Get token from localStorage
const getAuthToken = () => {
   const token = localStorage.getItem('token');
   if (!token) {
      console.warn('No authentication token found');
      // For testing, return a mock token with proper claims
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid';
   }
   return token;
};

// Execute API call with error handling
export const executeApiCall = async (endpoint, options = {}) => {
   const {
      method = 'GET',
      body = null,
      requiresAuth = false,
      requiredRole = null,
      isFormData = false
   } = options;

   const url = `${API_BASE_URL}${endpoint}`;

   const headers = {};

   // Add auth token if required
   if (requiresAuth) {
      const token = getAuthToken();
      if (!token) {
         throw new Error('No authentication token found');
      }
      headers['Authorization'] = `Bearer ${token}`;
   }

   // Add content type for JSON (not for FormData)
   if (!isFormData && body && typeof body === 'object' && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
   }

   const config = {
      method,
      headers,
   };

   // Add body if provided
   if (body) {
      if (isFormData) {
         config.body = body;
      } else if (typeof body === 'object') {
         config.body = JSON.stringify(body);
      } else {
         config.body = body;
      }
   }

   try {
      const response = await fetch(url, config);

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
         data = await response.json();
      } else {
         data = await response.text();
      }

      if (!response.ok) {
         // Handle error responses
         const errorMessage = data?.message || data || `HTTP ${response.status}: ${response.statusText}`;
         throw new Error(errorMessage);
      }

      return data;
   } catch (error) {
      console.error('API call failed:', error);

      // Show error toast
      toast.error(error.message || 'Có lỗi xảy ra khi gọi API');

      throw error;
   }
};

// Helper function to handle API responses
export const handleApiResponse = (response) => {
   if (response && response.data !== undefined) {
      return response.data;
   }
   return response;
};

// Helper function to handle API errors
export const handleApiError = (error) => {
   console.error('API Error:', error);

   if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;
      toast.error(message);
      return message;
   } else if (error.request) {
      // Request was made but no response received
      toast.error('Không thể kết nối đến server');
      return 'Không thể kết nối đến server';
   } else {
      // Something else happened
      toast.error(error.message || 'Có lỗi xảy ra');
      return error.message || 'Có lỗi xảy ra';
   }
};
