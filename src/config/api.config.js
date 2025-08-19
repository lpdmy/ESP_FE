// API Configuration
export const API_CONFIG = {
   // Base URLs
   BASE_URL: import.meta.env.PROD ? '/api' : 'https://localhost:7056/api',

   // Auth endpoints
   AUTH: {
      LOGIN: '/auth/login',
      GET_ME: '/auth/GetMe',
      IMPORT_FILE: '/auth/ImportFile',
      TEST: '/auth/Test'
   },

   // User endpoints (khi bạn thêm UserController)
   USER: {
      GET_ALL: '/user',
      GET_BY_ID: '/user/{id}',
      CREATE: '/user',
      UPDATE: '/user/{id}',
      DELETE: '/user/{id}'
   },

   // Course endpoints (khi bạn thêm CourseController)
   COURSE: {
      GET_ALL: '/course',
      GET_BY_ID: '/course/{id}',
      CREATE: '/course',
      UPDATE: '/course/{id}',
      DELETE: '/course/{id}'
   }
};

// HTTP Headers
export const getAuthHeaders = (token) => ({
   'Content-Type': 'application/json',
   'Authorization': token ? `Bearer ${token}` : ''
});

// API Response Handler
export const handleApiResponse = async (response) => {
   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
   }
   return response.json();
};
