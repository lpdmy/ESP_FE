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
  },
  USER_PROFILE: {
    PROFILE: "/profile",
    EDIT: "/profile/edit",
  },
  ACTIVITY:{
    LIST_EVENT : "/activity/list-event",
    ACTIVITY_DETAIL : "/activity/detail/:id",
  },
};
