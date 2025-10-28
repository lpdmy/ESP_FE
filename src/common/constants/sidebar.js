import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  Activity, 
  Gift, 
  GraduationCap, 
  MessageSquare, 
  Settings, 
  User 
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";

export const SIDEBAR_NAVIGATION = [
  {
    label: "Trang chủ",
    icon: Home,
    paths: [ROUTES.LANDING.HOME],
  },
  {
    label: "Bạn bè",
    icon: Users,
    paths: ["/friends"],
    count: 24,
  },
  {
    label: "Sự kiện",
    icon: Calendar,
    paths: ["/events"],
    count: 5,
  },
  {
    label: "Dòng thời gian",
    icon: Clock,
    paths: ["/timeline"],
  },
  {
    label: "Hoạt động",
    icon: Activity,
    paths: ["/activities"],
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
    paths: ["/my-class"],
  },
  {
    label: "Tin nhắn",
    icon: MessageSquare,
    paths: ['/chat'],
    count: 3,
  },
  {
    label: "Hồ sơ",
    icon: User,
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
