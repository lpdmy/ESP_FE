import { toast } from "react-toastify";
import { connectNotificationHub } from "@/features/notifications/services/signalr/notificationHub";
import { Bell } from "lucide-react";
import { addNotification } from "@/store/notification/notificationSlice";
import { ROLE } from "@/common/constants/roles";
import { store } from "@/store";

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
      // Check if user is admin or on admin page - ADMIN KHÔNG NHẬN NOTIFICATION
      const state = store.getState();
      const user = state?.user?.user;
      const pathname = window.location.pathname;
      
      const isAdminRole = user && (
        user.role === ROLE.ADMIN || 
        user.role === 0 ||
        user.role === 'Admin' ||
        user.roles?.includes('Admin') || 
        user.roles?.some(role => role.name === 'Admin' || role === 0)
      );
      
      const isAdminPage = pathname.startsWith('/admin');
      const isAdmin = isAdminRole || isAdminPage;
      
      // ADMIN KHÔNG NHẬN NOTIFICATION - RETURN NGAY
      if (isAdmin) {
        return; // Không hiển thị toast, không add vào store
      }
      
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
      
      // Toast style - màu cam cho user thường (admin đã được filter ở trên)
      const toastStyle = {
        background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)", // Orange gradient for regular users
        color: "#fff",
        fontWeight: "500",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(255, 102, 0, 0.3)",
        minWidth: "280px",
        maxWidth: "380px",
        padding: "12px 16px",
        fontSize: "14px",
      };
      
      // Toast nhỏ gọn hơn
      toast.info(toastContent, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        icon: <Bell className="w-4 h-4 text-white" />,
        style: toastStyle,
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
