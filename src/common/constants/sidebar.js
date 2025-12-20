import {
  Activity,
  Gift,
  GraduationCap,
  MessageSquare,
  Settings,
  User,
  Bell,
  Star,
  Trophy,
  Users,
  Book
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";
export const SIDEBAR_NAVIGATION = [
  {
    label: "Hoạt động",
    icon: Activity,
    paths: ["/activities"],
  },
  {
    label: "Câu lạc bộ",
    icon: Trophy,
    key: "clubs",
    paths: ["/club/list-club"],
  },
  {
    label: "Giám khảo",
    icon: Book,
    paths: [ROUTES.JURY.JURY_DASHBOARD],
  },
  {
    label: "Đổi thưởng",
    icon: Gift,
    paths: [
      ROUTES.STAR_POINT.REWARD_STORE,
      ROUTES.STAR_POINT.REWARD_DETAIL,
      ROUTES.STAR_POINT.HISTORY,
    ],
  },
  {
    label: "Lớp học của tôi",
    icon: GraduationCap,
    key: "my-class",
    paths: ["/my-classes"],
  },
  {
    label: "Tin nhắn",
    icon: MessageSquare,
    paths: ['/chat'],
  },
  {
    label: "Thông báo hệ thống",
    icon: Bell,
    paths: [
      ROUTES.SYSTEM_NEWS_AND_NOTICES.LIST,
      ROUTES.SYSTEM_NEWS_AND_NOTICES.DETAIL
    ],
  },
  {
    label: "Hồ sơ",
    icon: User,
    key: "profile",
    paths: [
      ROUTES.USER_PROFILE.PROFILE,
      ROUTES.USER_PROFILE.EDIT,
      ROUTES.USER_PROFILE.TEACHER_PROFILE,
      ROUTES.USER_PROFILE.EDIT_TEACHER,
    ],
  },
  {
    label: "Cài đặt",
    icon: Settings,
    paths: ["/settings"],
  },
];

export const SIDEBAR_DEFAULT_TAB = "Trang chủ";

// Active tab constants for easy reference
export const ACTIVE_TABS = {
  HOME: "Trang chủ",
  FRIENDS: "Bạn bè",
  EVENTS: "Sự kiện",
  TIMELINE: "Dòng thời gian",
  ACTIVITIES: "Hoạt động",
  REWARDS: "Đổi thưởng",
  MY_CLASS: "Lớp học của tôi",
  MESSAGES: "Tin nhắn",
  SETTINGS: "Cài đặt"
};
