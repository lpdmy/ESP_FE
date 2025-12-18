import { API_CONFIG } from "@/config/api.config";
import * as signalR from "@microsoft/signalr";

let connection = null;
let isConnecting = false;

/**
 * Connect to NotificationHub
 */
export async function connectNotificationHub(userId, onReceiveNotification) {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  if (isConnecting) {
    return connection;
  }

  isConnecting = true;
  const token = localStorage.getItem("token");

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_CONFIG.BASE_HUB_URL}/hubs/notification?userId=${userId}&access_token=${token}`, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Trace)
    .build();

  // Receive notifications
  connection.on("ReceiveNotification", onReceiveNotification);

  // Receive urgent announcement notifications
  connection.on("UrgentAnnouncement", (announcement) => {
    // Trigger custom event for SystemAnnouncementProvider
    window.dispatchEvent(new CustomEvent('urgentAnnouncement', { detail: announcement }));
  });

  try {
    await connection.start(); // force LongPolling for dev
  } catch (err) {
    console.error("🚨 SignalR failed to start:", err);
    connection = null; // ensure clean state on failure
  } finally {
    isConnecting = false;
  }

  return connection;
}

/**
 * Disconnect
 */
export async function disconnectNotificationHub() {
  if (connection) {
    // ⚠️ Chỉ gọi stop() nếu kết nối không ở trạng thái Disconnected hoặc None
    if (
      connection.state !== signalR.HubConnectionState.Disconnected &&
      connection.state !== signalR.HubConnectionState.None
    ) {
      try {
        await connection.stop();
      } catch (err) {
        // Có thể bỏ qua lỗi này vì nó thường là AbortError hoặc lỗi đã được ghi lại
      }
    } else {
      // Đã bị ngắt kết nối hoặc chưa bắt đầu, chỉ cần dọn dẹp biến cục bộ
    }

    connection = null;
    isConnecting = false;
  }
}