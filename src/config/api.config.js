// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: (() => {
    const hostname = window.location.hostname;
    
    // Development environment
    if (hostname.includes("edusphere-dev")) {
      return "https://esp-dev-api-h0exebdyd0e0e2cn.eastasia-01.azurewebsites.net/api";
    }
    
    // Local development
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "https://localhost:7084/api";
    }
    
    // Production environment
    return "https://esp-prod-api.yourdomain.com/api";
  })(),

  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    GET_ME: '/auth/GetMe',
    IMPORT_FILE: '/auth/ImportFile',
    ONE_TIME_LOGIN: '/auth/one-time-login',
    CHANGE_PASSWORD_OTL: '/auth/change-password-otl',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CREATE_USER: '/auth/create-user',
    TEST: '/auth/Test',
  },

  // User endpoints
  USER: {
    GET_ALL: '/users',
    GET_BY_ID: '/users/{id}',
    CREATE: '/users',
    UPDATE: '/users',
    STATISTICS: '/user/statistics',
    DELETE: '/users',
    STUDENT_PROFILE: '/user/student-profile',
  },

  // UserProfile endpoints
  USER_PROFILE: {
    MY_PROFILE: '/userprofile/my-profile',
    MY_TEACHER_PROFILE: '/userprofile/my-teacher-profile',
    ALL_PROFILES: '/userprofile/all',
    PROFILE_BY_ID: '/userprofile/{id}',
    CREATE_PROFILE: '/userprofile',
    UPDATE_PROFILE: '/userprofile/{id}',
    UPDATE_TEACHER_PROFILE: '/userprofile/my-teacher-profile',
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
  POST :{
    CREATE_POST : '/post',
    USER_POST:'/post/user',
    DELETE_POST:'/post',
    UPDATE_POST:'/post'
  }
};

// HTTP Headers
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : ''
});

// API Response Handler
export async function handleApiResponse(response) {
  console.log('API Response status:', response.status);
  console.log('API Response headers:', response.headers);
  
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    console.log('API Error - Status:', response.status);
    // Nếu là JSON thì parse, không thì trả về text
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      console.log('API Error Data:', errorData);
      throw errorData;
    } else {
      const errorText = await response.text();
      console.log('API Error Text:', errorText);
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
