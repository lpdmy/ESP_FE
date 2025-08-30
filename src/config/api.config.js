// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: import.meta.env.PROD
    ? (window.location.hostname.includes('lemon-cliff-00e25c800.2.azurestaticapps.net')
      ?  'https://esp-dev-api-h0exebdyd0e0e2cn.eastasia-01.azurewebsites.net/api'
      : 'test') 
      : 'https://localhost:7084/api',

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
export async function handleApiResponse(response) {
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    // Nếu là JSON thì parse, không thì trả về text
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw errorData;
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  }
  // Nếu là JSON thì parse, không thì trả về text
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
}
