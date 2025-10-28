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
      console.log("Received notification:", notification);
      
      // Gọi callback nếu có
      onNewNotification?.(notification);
      dispatch(addNotification(notification))
      // Hiển thị toast
      toast.info(notification.title, {
        position: "bottom-right",
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
        },
      });
    });
  } catch (err) {
    console.error("SignalR init error:", err);
    window.__signalRConnected = false; // allow retry if failed
  }
}
