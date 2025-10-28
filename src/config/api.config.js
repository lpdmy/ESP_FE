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

  BASE_HUB_URL: (() => {
    const hostname = window.location.hostname;

    // Development environment
    if (hostname.includes("edusphere-dev")) {
      return "https://esp-dev-api-h0exebdyd0e0e2cn.eastasia-01.azurewebsites.net";
    }

    // Local development
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "https://localhost:7084";
    }

    // Production environment
    return "https://esp-prod-api.yourdomain.com";
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
    UPLOAD_IMAGE: '/upload',
    UPLOAD_FILE: '/upload/file'
  },
  // Search endpoints  
  SEARCH: {
    GLOBAL: '/search',
    USERS: '/search/users',
    POSTS: '/search/posts',
    ACTIVITIES: '/search/activities',
    CLUBS: '/search/clubs',
    HASHTAGS: '/search/hashtags',
    ADVANCED: '/search/advanced',
    SUGGESTIONS: '/search/suggestions',
    TRENDING: '/search/trending',
    HISTORY: '/search/history',
  },
  POST :{
    CREATE_POST : '/post',
    USER_POST:'/post/user',
    DELETE_POST:'/post',
    UPDATE_POST:'/post',
    LIKE_POST:'/post/like',
    CLUB_PENDING_POST:'/post/club/pending',
    APPROVE_POST:'/post/approve/{id}',
    CLUB_POST:'/post/club',
    REJECT_POST:'/post/reject',
    GET_POSTS_BY_CLASS_GROUP: '/post/classgroup/{id}',
    GET_ALL_POSTS: '/post',
  },
  COLLECTION: {
    CREATE_COLLECTION: '/collection',
    DELETE_COLLECTION: '/collection',
    UPDATE_COLLECTION: '/collection',
    USER_COLLECTION: '/collection/user',
    ADD_COLLECTION_ITEAM: '/collection/add-collection-iteam'
  },
  CLUB:{
    CREATE_CLUB:'/club-creation-request',
    LIST_CLUB:'/club',
    CLUB_CATEGORY:'/club/categories',
    CLUB_DETAIL:'/club/{id}',
    CLUB_JOIN_REQUEST:'/join-request/club',
    CLUB_CREATE_JOIN_REQUES:'/join-request',
    CLUB_CANCEL_JOIN_REQUES:'/join-request/{id}',
    CLUB_APPROVE_JOIN_REQUEST:'/join-request/approve/{id}',
    CLUB_REJECT_JOIN_REQUEST:'/join-request/reject/{id}',
    USER_CLUB :'/club-member/user',
    UPDATE_CLUB:'/club',
    LEAVE_CLUB:'/club-member/{id}',
    KICK_CLUB:'/club-member',
    CLUB_CREATION_REQUEST:'/club-creation-request',
    CLUB_APPROVE_CREATION_REQUEST:'/club-creation-request/approve/{id}',
    CLUB_REJECT_CREATION_REQUEST:'/club-creation-request/reject',
    CLUB_SEARCH_USER:'/club/search-users',
    CLUB_INVITE_MENTOR:'/join-request/invite-mentor',
    CLUB_GET_INVITATION: '/join-request/user',
    CLUB_CHANGE_ROLE:'/club-member/change-role',
    CLUB_DELETE:'/club'
  },
  COMMENT:{
    CREATE_COMMENT:'/comment',
    GET_BY_POST:'/comment/post',
    GET_BY_COMMENT:'/comment/comment',
    DELETE_COMMENT:'/comment/{id}'},

  // Student Import endpoints
  STUDENT_IMPORT: {
    IMPORT_STUDENTS: '/admin/students/import',
    VALIDATE_STUDENTS: '/admin/students/validate',
    DOWNLOAD_TEMPLATE: '/admin/students/template'
  },

  STAR_POINT: {
    // Rules
    UPDATE_REWARD_RULE: "/admin/rules/{actionType}/points",
    GET_RULES: "/admin/rules",

    // Rewards
    GET_ALL_REWARDS: "/admin/rewards",
    GET_REWARD_BY_ID: "/admin/rewards/{id}",
    CREATE_REWARD: "/admin/rewards",
    UPDATE_REWARD: "/admin/rewards/{id}",
    DELETE_REWARD: "/admin/rewards/{id}",
    REDEEM_REWARD: "/rewards/redeem",
    GET_POINT_HISTORY: '/points/history',
    GET_USER_POINTS: "/points/current",

    GET_ALL_REDEMPTIONS_ADMIN: "/redeems/admin",
    GET_MY_REDEMPTIONS: "/redeems/me",
    PICKUP_REDEMPTION: "/redeems/{id}/pickup"
  },

  NOTIFICATION: {
    BASE: '/notification',
    GET_BY_USER: '/notification/user',
    MARK_AS_READ: '/notification/{id}/read',
    ADD: '/notification',
    ADD_TEST: '/notification/test'
  },

  // Chat endpoints
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: '/chat/messages',
    GET_MESSAGES: '/chat/messages/{roomId}',
    MARK_AS_READ: '/chat/messages/{roomId}/read', 
  },
  // Class Group endpoints
  CLASS_GROUP: {
    LIST: '/classgroup',
    GET_BY_ID: '/classgroup/{id}',
    GET_DETAIL: '/classgroup/{id}/detail',
    GET_BY_NAME: '/classgroup/by-name',
    DASHBOARD: '/classgroup/dashboard',
    BY_GRADE: '/classgroup/by-grade/{grade}',
    WITHOUT_GRADE: '/classgroup/without-grade',
    BY_ACADEMIC_YEAR: '/classgroup/by-academic-year/{academicYearId}',
    WITHOUT_ACADEMIC_YEAR: '/classgroup/without-academic-year',
    DELETED: '/classgroup/deleted',
    FILTER: '/classgroup/filter',
    CHECK_NAME_EXISTS: '/classgroup/check-name-exists',
    CREATE: '/classgroup',
    UPDATE: '/classgroup/{id}',
    DELETE: '/classgroup/{id}',
    // Student management endpoints
    GET_STUDENTS: '/classgroup/{id}/students',
    ADD_STUDENT: '/classgroup/{id}/students',
    REMOVE_STUDENT: '/classgroup/{id}/students/{studentId}',
    // Homeroom Teacher management endpoints
    ASSIGN_HOMEROOM_TEACHER: '/classgroup/{id}/homeroom-teacher',
    REMOVE_HOMEROOM_TEACHER: '/classgroup/{id}/homeroom-teacher',
    GET_HOMEROOM_TEACHER: '/classgroup/{id}/homeroom-teacher',
    // Academic Year endpoints
    GET_ACADEMIC_YEARS: '/classgroup/academic-years',
    GET_CURRENT_ACADEMIC_YEAR: '/classgroup/academic-years-current',
    // Current Class endpoints
    GET_CURRENT_CLASS: '/classgroup/current-class'
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