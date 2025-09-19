// API Configuration
export const API_CONFIG = {
  // Base URLs
   BASE_URL:
    window.location.hostname.includes("edusphere-dev")
      ? "https://esp-dev-api-h0exebdyd0e0e2cn.eastasia-01.azurewebsites.net/api"
      : window.location.hostname.includes("localhost")
      ? "https://localhost:7084/api"
      : "https://esp-test-api.yourdomain.com/api",

  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    GET_ME: '/auth/GetMe',
    IMPORT_FILE: '/auth/ImportFile',
    ONE_TIME_LOGIN: '/auth/one-time-login',
    CHANGE_PASSWORD_OTL: '/auth/change-password-otl',
    CREATE_USER: '/auth/create-user',
    TEST: '/auth/Test',
  },

  // User endpoints
  USER: {
    GET_ALL: '/user/get-all',
    GET_BY_ID: '/user/get-by-id',
    CREATE: '/user',
    UPDATE: '/user/update',
    DELETE: '/user/delete',
    STUDENT_PROFILE: '/user/student-profile',
  },

  // UserProfile endpoints
  USER_PROFILE: {
    MY_PROFILE: '/userprofile/my-profile',
    ALL_PROFILES: '/userprofile/all',
    PROFILE_BY_ID: '/userprofile/{id}',
    CREATE_PROFILE: '/userprofile',
    UPDATE_PROFILE: '/userprofile/{id}',
    DELETE_PROFILE: '/userprofile/{id}',
    CHECK_PROFILE_EXISTS: '/userprofile/{id}/exists',
  },

  // Course endpoints (khi bạn thêm CourseController)
  COURSE: {
    GET_ALL: '/course',
    GET_BY_ID: '/course/{id}',
    CREATE: '/course',
    UPDATE: '/course/{id}',
    DELETE: '/course/{id}'
  },

  UPLOAD: {
    UPLOAD_IMAGE: '/upload'
  },
  ACTIVITY:{
    GET_ALL:'/activity',
    GET_BY_ID:'/activity/{id}'
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
