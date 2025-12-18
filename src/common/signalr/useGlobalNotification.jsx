import { toast } from "react-toastify";
import { connectNotificationHub } from "@/features/notifications/services/signalr/notificationHub";
import { Bell } from "lucide-react";
import { addNotification } from "@/store/notification/notificationSlice";

/**
 * Khởi tạo kết nối SignalR và hiển thị toast khi có thông báo mới.
 * @param {number} userId - ID người dùng
 * @param {(notification: any) => void} onNewNotification - callback khi nhận thông báo mới
 */
export async function initGlobalNotification(userId, dispatch, onNewNotification) {
  if (!userId || window.__signalRConnected) return;

  window.__signalRConnected = true;

  try {
    await connectNotificationHub(userId, (notification) => {
      // Gọi callback nếu có
      onNewNotification?.(notification);
      
      // Thêm notification vào Redux store (sẽ tự động cập nhật badge count)
      dispatch(addNotification(notification));
      
      // Hiển thị toast notification với thông tin đầy đủ
      const toastContent = (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{notification.title || "Thông báo mới"}</div>
          {notification.message && (
            <div className="text-sm text-white/90">{notification.message}</div>
          )}
        </div>
      );
      
      toast.info(toastContent, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        icon: <Bell className="w-5 h-5 text-white" />,
        style: {
          background: "#FF6600",
          color: "#fff",
          fontWeight: "500",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: "300px",
        },
        onClick: () => {
          // Navigate to notification page or link if available
          if (notification.link) {
            window.location.href = notification.link;
          }
        },
      });
    });
  } catch (err) {
    console.error("SignalR init error:", err);
    window.__signalRConnected = false; // allow retry if failed
  }
}
