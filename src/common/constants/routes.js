export const ROUTES = {
  LANDING: {
    HOME: "/",
  },
  AUTH: {
    LOGIN: "/auth/login",
    ONE_TIME_LOGIN: "/auth/one-time-login",
    FORGETPASSWORD: "/auth/forget-password",
    CHANGEPASSWORD: "/auth/change-password",
  },
  ADMIN: {
    USER_MANAGEMENT: "/admin/users",
    MAIN: "/admin",
    REWARDS: "/admin/rewards",
    IMPORT_USERS: "/admin/users/import",
    CLUB: "/admin/clubs",
    SYSTEM_NEWS_AND_NOTICES: "/admin/system-news-and-notices",
    SYSTEM_NEWS_AND_NOTICES_DETAIL: "/admin/system-news-and-notices/:id",
    CLUB: "/admin/clubs",
    STAFF: "/admin/staff",
    ACTIVITIES: "/admin/activities",
    CREATE_ACTIVITY: "/admin/activities/create",
    EDIT_ACTIVITY: "/admin/activities/:id/edit",
    AI_SCHEDULE: "/admin/activities/:id/ai-schedule",
    CLASSES: 'admin/classes',
    CLASS_DETAIL: '/admin/classes/:id'
  },
  USER_PROFILE: {
    PROFILE: "/profile",
    PROFILEId: "/student-profile/:id",
    EDIT: "/profile/edit",
    TEACHER_PROFILE: "/profile/teacher",
    TEACHER_PROFILE_id: "/teacher-profile/:id",
    EDIT_TEACHER: "/profile/teacher/edit",
  },
  ONBOARDING: {
    ONBOARDING: "/onboarding",
  },
  COLLECTION: {
    LIST_COLLECTION: "/list-collection",
    COLLECTION_DETAIL: "/collection-detail/:id",
  },
  CLUB: {
    CREATE_CLUB: "/club/create-club-creation",
    LIST_CLUB: "/club/list-club",
    CLUB_DETAIL: "/club/:id",
    MANAGE_CLUB: "/club/manage/:id",
  },
  STAR_POINT: {
    REWARD_STORE: "/reward-store",
    REWARD_DETAIL: "/reward-store/:id",
    HISTORY: "/points/history",
    MY_REDEMPTIONS: "/points/my-redemptions",
  },
  SYSTEM_NEWS_AND_NOTICES: {
    // Thay đổi từ SYSTEM_ANNOUNCEMENTS
    LIST: "/system-news-and-notices",
    DETAIL: "/system-news-and-notices/:id",
  },
  SEARCH: {
    STUDENT: "/Search/students",
    TEACHER: "/Search/teachers"
  },
  CHAT: {
    CHAT_PAGE: "/chat/:roomId",
    INBOX: "/chat",
  },
  ACTIVITY: {
    LIST: "/activities",
    VIEW_ACTIVITY: "/activities/:id",
    REGISTER_ACTIVITY: "/activities/:id/register",
  },
  NOTIFICATION: {
    LIST_NOTIFICATION: "/notifications",
  },
  JURY:{
    ASSIGN_JURY:"/jury/assign-jury/:id",
    JURY_DASHBOARD:"/jury/dashboard",
    JURY_SUBMISSION:"/jury/submission/:id",
    JURY_GRADE :"/jury/grade/:id"
  },
  SUBMISSION:{
    MY_SUBMISSION : "/submission/my-submission",
    MY_SUBMISSION_DETAIL : "/submission/my-submission/detail/:id",
  }
};

