import { motion } from "framer-motion"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { useNavigate } from "react-router-dom"
import NotificationItem from "@/features/notifications/NotificationItem"
import { useNotificationApi } from "@/features/notifications/hooks/useNotificationApi";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
const mockNotifications = [
  {
    id: "1",
    type: "event",
    avatar: "SK",
    title: "Sự kiện 'Hackathon 2024' sắp diễn ra. Bạn có muốn tham gia không?",
    timestamp: "2 phút trước",
    read: false,
    actions: [
      {
        type: "confirm",
        label: "Tham gia",
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        },
      },
      {
        type: "reject",
        label: "Từ chối",
        variant: "outline",
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        },
      },
    ],
  },
  {
    id: "2",
    type: "message",
    avatar: "MA",
    title: "Minh Anh đã gửi cho bạn một tin nhắn",
    timestamp: "5 phút trước",
    link: "/chat/1",
    read: false,
  },
  {
    id: "3",
    type: "friend",
    avatar: "TN",
    title: "Thu Ngân đã gửi lời mời kết bạn",
    timestamp: "1 giờ trước",
    read: false,
    actions: [
      {
        type: "confirm",
        label: "Chấp nhận",
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        },
      },
      {
        type: "reject",
        label: "Từ chối",
        variant: "outline",
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        },
      },
    ],
  },
  {
    id: "4",
    type: "like",
    avatar: "HL",
    title: "Hoàng Long đã thích bài viết của bạn",
    timestamp: "2 giờ trước",
    read: true,
  },
  {
    id: "5",
    type: "achievement",
    avatar: "🏆",
    title: "Bạn đã đạt thành tích 'Người học tích cực'",
    timestamp: "3 giờ trước",
    read: true,
  },
  {
    id: "6",
    type: "event",
    avatar: "CT",
    title: "Cuộc thi 'Code Challenge' đang chờ bạn xác nhận tham gia",
    timestamp: "5 giờ trước",
    read: true,
    actions: [
      {
        type: "confirm",
        label: "Xác nhận",
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
        },
      },
      {
        type: "view",
        label: "Xem chi tiết",
        variant: "outline",
        onClick: async () => {
          window.location.href = "/contests"
        },
      },
    ],
  },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const user = useSelector((state) => state.user.user);
  const { getByUser } = useNotificationApi();

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const { markAsRead } = useNotificationApi();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      try {
        const data = await getByUser();
        if (data) setNotifications(data);
      } catch (error) {
        console.error("Lỗi khi load thông báo:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tất cả thông báo</h1>
        </div>
      </div>
      <div className="mx-auto py-4">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={
              filter === "unread"
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            Chưa đọc ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mx-auto pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Đang tải thông báo...
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                markAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">Không có thông báo nào</p>
              <p className="text-sm mt-1">Bạn đã xem hết tất cả thông báo</p>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  )
}
