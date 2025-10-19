export const ROUTES = {
  LANDING: {
    HOME: "/",
  },
  AUTH: {
    LOGIN: "/auth/login",
    ONE_TIME_LOGIN: "/auth/one-time-login",
    FORGETPASSWORD: "/auth/forget-password",
    CHANGEPASSWORD: "/auth/change-password"
  },
  ADMIN: {
    USER_MANAGEMENT: "/admin/users",
    MAIN: "/admin",
    REWARDS: "/admin/rewards",
    IMPORT_USERS: "/admin/users/import",
  },
  USER_PROFILE: {
    PROFILE: "/profile",
    EDIT: "/profile/edit",
    TEACHER_PROFILE: "/profile/teacher",
    EDIT_TEACHER: "/profile/teacher/edit",
  },
  ONBOARDING: {
    ONBOARDING: "/onboarding",
  },
  COLLECTION:{
    LIST_COLLECTION : "/list-collection",
    COLLECTION_DETAIL: "/collection-detail/:id"
  },
  STAR_POINT: {
    REWARD_STORE: "/reward-store",              
    REWARD_DETAIL: "/reward-store/:id",       
    HISTORY: "/points/history",       
    MY_REDEMPTIONS: "/points/my-redemptions"        
  },
};
