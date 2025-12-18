import { API_CONFIG } from "@/config/api.config";
import * as signalR from "@microsoft/signalr";

let chatConnection = null;

/**
 * Kết nối tới ChatHub SignalR
 * @param {number} userId - ID người dùng
 * @param {(message: any) => void} onReceiveMessage - callback khi nhận tin nhắn mới
 */
export async function connectChatHub(userId, onReceiveMessage) {
  if (!userId) throw new Error("Missing userId for ChatHub");

  // Nếu đã có kết nối đang hoạt động thì bỏ qua
  if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
    return chatConnection;
  }
  const token = localStorage.getItem("token");

  chatConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_CONFIG.BASE_HUB_URL}/hubs/chat?userId=${userId}&access_token=${token}`, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Trace)
    .build();

  chatConnection.on("ReceiveMessage", (message) => {
    onReceiveMessage?.(message);
  });

  chatConnection.onclose((error) => {
  });

  await chatConnection.start();

  return chatConnection;
}

export async function disconnectChatHub() {
  if (chatConnection) {
    try {
      await chatConnection.stop();
    } catch (error) {
    } finally {
      chatConnection = null;
      window.__chatHubConnected = false;
    }
  }
}

/**
 * Join a chat room
 * @param {string} roomId - Room ID to join
 */
export async function joinChatRoom(roomId) {
  if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
    try {
      await chatConnection.invoke("JoinRoom", roomId);
    } catch (error) {
    }
  } else {
  }
}

/**
 * Leave a chat room
 * @param {string} roomId - Room ID to leave
 */
export async function leaveChatRoom(roomId) {
  if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
    try {
      await chatConnection.invoke("LeaveRoom", roomId);
    } catch (error) {
    }
  } else {
  }
}

/**
 * Send a message to a chat room
 * @param {string} roomId - Room ID
 * @param {number} senderId - Sender user ID
 * @param {string} content - Message content
 * @param {string} type - Message type (default: "text")
 */
export async function sendChatMessage(roomId, senderId, content, type = "text") {
  if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
    try {
      await chatConnection.invoke("SendMessage", roomId, senderId, content, type);
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error("ChatHub not connected");
  }
}

export async function ensureChatConnected(userId, onReceiveMessage) {
  if (!chatConnection || chatConnection.state !== signalR.HubConnectionState.Connected) {
    await connectChatHub(userId, onReceiveMessage);
  }
  return chatConnection;
}