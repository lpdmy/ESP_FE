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
    CLUB:"/admin/clubs"
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
  CLUB:{
    CREATE_CLUB:"/club/create-club-creation",
    LIST_CLUB:"/club/list-club",
    CLUB_DETAIL:"/club/:id",
    MANAGE_CLUB:"/club/manage/:id"
  },
  STAR_POINT: {
    REWARD_STORE: "/reward-store",              
    REWARD_DETAIL: "/reward-store/:id",       
    HISTORY: "/points/history",       
    MY_REDEMPTIONS: "/points/my-redemptions"        
  },
  SEARCH:{
    STUDENT:"/Search/students",
    TEACHER:"/Search/teachers"
  },
  CHAT: {
    CHAT_PAGE: "/chat/:roomId",
    INBOX: "/chat",
  },
  NOTIFICATION: {
    LIST_NOTIFICATION: "/notifications",
  }
};
