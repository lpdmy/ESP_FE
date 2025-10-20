import { Home, Users, Calendar, Clock, Activity, Gift, GraduationCap, MessageSquare, Settings } from "lucide-react";

export const SIDEBAR_NAVIGATION = [
  { icon: Home, label: "Trang chủ", key: "home", href: "/" },
  { icon: Users, label: "Bạn bè", key: "friends", count: 24, href: "/friends" },
  { icon: Calendar, label: "Sự kiện", key: "events", count: 5, href: "/events" },
  { icon: Clock, label: "Dòng thời gian", key: "timeline", href: "/timeline" },
  { icon: Activity, label: "Hoạt động", key: "activities", href: "/activities" },
  { icon: Gift, label: "Đổi thưởng", key: "rewards", href: "/rewards" },
  { icon: GraduationCap, label: "Lớp học của tôi", key: "my-class", href: "/my-classes" },
  { icon: MessageSquare, label: "Tin nhắn", key: "messages", count: 3, href: "/messages" },
  { icon: Settings, label: "Cài đặt", key: "settings", href: "/settings" },
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
