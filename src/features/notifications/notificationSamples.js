// Mẫu dữ liệu notification để test NotificationItem component
// Import và sử dụng: import { notificationSamples, notificationList } from "@/features/notifications/notificationSamples"

export const notificationSamples = {
  // Notification có action (Xác nhận/Từ chối) - Event invitation
  withActions: {
    id: 1,
    type: "event", // message, like, friend, achievement, event, system
    title: "Bạn đã nhận được lời mời tham gia hoạt động 'Hội thao Liên trường 2024'",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
    read: false,
    avatar: "https://i.pravatar.cc/150?img=1",
    link: "/activities/123",
    actions: [
      {
        label: "Tham gia",
        type: "confirm",
        variant: "default",
        onClick: async () => {
          console.log("Đã xác nhận tham gia")
          // Call API để xác nhận: await joinActivity(123)
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      },
      {
        label: "Từ chối",
        type: "reject",
        variant: "outline",
        onClick: async () => {
          console.log("Đã từ chối")
          // Call API để từ chối: await rejectActivity(123)
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    ]
  },

  // Notification đã đọc
  read: {
    id: 2,
    type: "message",
    title: "Bạn có tin nhắn mới từ Nguyễn Văn A",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    read: true,
    avatar: "https://i.pravatar.cc/150?img=2",
    link: "/messages/123"
  },

  // Notification like
  like: {
    id: 3,
    type: "like",
    title: "Nguyễn Văn B đã thích bài viết của bạn",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 phút trước
    read: false,
    avatar: "https://i.pravatar.cc/150?img=3",
    link: "/posts/456"
  },

  // Notification friend request
  friend: {
    id: 4,
    type: "friend",
    title: "Trần Thị C đã gửi lời mời kết bạn",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
    read: false,
    avatar: "https://i.pravatar.cc/150?img=4",
    link: "/friends/requests",
    actions: [
      {
        label: "Chấp nhận",
        type: "confirm",
        variant: "default",
        onClick: async () => {
          console.log("Đã chấp nhận lời mời kết bạn")
        }
      },
      {
        label: "Từ chối",
        type: "reject",
        variant: "outline",
        onClick: async () => {
          console.log("Đã từ chối lời mời kết bạn")
        }
      }
    ]
  },

  // Notification achievement
  achievement: {
    id: 5,
    type: "achievement",
    title: "Chúc mừng! Bạn đã đạt thành tích 'Thành viên tích cực'",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 giờ trước
    read: false,
    avatar: null, // Không có avatar
    link: "/achievements/789"
  },

  // Notification system
  system: {
    id: 6,
    type: "system",
    title: "Hệ thống sẽ bảo trì từ 02:00 - 04:00 ngày mai",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 giờ trước
    read: true,
    avatar: null,
    link: null // Không có link
  },

  // Notification không có avatar
  noAvatar: {
    id: 7,
    type: "event",
    title: "Hoạt động 'Workshop Lập trình' sẽ diễn ra vào ngày mai",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 phút trước
    read: false,
    avatar: null, // Sẽ hiển thị chữ cái đầu "HT" (hoặc lấy từ title)
    link: "/activities/workshop-123"
  },

  // Notification với action đơn giản (chỉ xem)
  viewOnly: {
    id: 8,
    type: "message",
    title: "Bạn có 5 tin nhắn chưa đọc",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 phút trước
    read: false,
    avatar: "https://i.pravatar.cc/150?img=5",
    link: "/messages",
    actions: [
      {
        label: "Xem ngay",
        type: "view",
        variant: "default",
        onClick: async () => {
          console.log("Chuyển đến trang messages")
          // navigate("/messages")
        }
      }
    ]
  }
}

// Array mẫu để test list notifications
export const notificationList = [
  notificationSamples.withActions,
  notificationSamples.read,
  notificationSamples.like,
  notificationSamples.friend,
  notificationSamples.achievement,
  notificationSamples.system,
  notificationSamples.noAvatar,
  notificationSamples.viewOnly
]

// Quick copy-paste examples:

// 1. Notification đơn giản (không có action):
const simpleNotification = {
  id: "1",
  type: "message",
  title: "Bạn có tin nhắn mới",
  createdAt: new Date().toISOString(),
  read: false,
  avatar: "https://i.pravatar.cc/150?img=1",
  link: "/messages/123"
}

// 2. Notification với actions (Xác nhận/Từ chối):
const actionNotification = {
  id: "2",
  type: "event",
  title: "Lời mời tham gia hoạt động",
  createdAt: new Date().toISOString(),
  read: false,
  avatar: null,
  link: "/activities/456",
  actions: [
    {
      label: "Xác nhận",
      type: "confirm",
      variant: "default",
      onClick: async () => {
        // Call API
        console.log("Confirmed")
      }
    },
    {
      label: "Từ chối",
      type: "reject",
      variant: "outline",
      onClick: async () => {
        // Call API
        console.log("Rejected")
      }
    }
  ]
}

// 3. Notification system (không có link):
const systemNotification = {
  id: "3",
  type: "system",
  title: "Hệ thống sẽ bảo trì lúc 02:00",
  createdAt: new Date().toISOString(),
  read: false,
  avatar: null,
  link: null // Không click được
}

// Cấu trúc dữ liệu chi tiết
export const notificationStructure = {
  id: "number | string - ID duy nhất của notification",
  type: "string - Loại notification: 'message' | 'like' | 'friend' | 'achievement' | 'event' | 'system'",
  title: "string - Tiêu đề/thông báo",
  createdAt: "string - ISO date string (new Date().toISOString())",
  read: "boolean - Đã đọc chưa (false = chưa đọc, sẽ có nền cam nhạt)",
  avatar: "string | null - URL ảnh đại diện (null sẽ hiển thị chữ cái đầu)",
  link: "string | null - Link điều hướng khi click (null = không click được)",
  actions: "array | undefined - Mảng các action buttons (optional)",
  // actions[].label: "string - Text hiển thị trên button",
  // actions[].type: "string - 'confirm' | 'reject' | other",
  // actions[].variant: "string - Button variant từ UI component",
  // actions[].onClick: "async function - Function xử lý khi click"
}

