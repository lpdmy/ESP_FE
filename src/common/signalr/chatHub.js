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
    console.log("🔁 ChatHub already connected");
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
    console.log("💬 Received message:", message);
    onReceiveMessage?.(message);
  });

  chatConnection.onclose((error) => {
    console.warn("⚠️ ChatHub disconnected", error);
  });

  await chatConnection.start();
  console.log("✅ Connected to ChatHub");

  return chatConnection;
}

export async function disconnectChatHub() {
  if (chatConnection) {
    try {
      await chatConnection.stop();
      console.log("🔌 Disconnected from ChatHub");
    } catch (error) {
      console.error("❌ Error while disconnecting ChatHub:", error);
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
      console.log(`✅ Joined room: ${roomId}`);
    } catch (error) {
      console.error(`❌ Error joining room ${roomId}:`, error);
    }
  } else {
    console.warn("⚠️ ChatHub not connected. Cannot join room.");
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
      console.log(`✅ Left room: ${roomId}`);
    } catch (error) {
      console.error(`❌ Error leaving room ${roomId}:`, error);
    }
  } else {
    console.warn("⚠️ ChatHub not connected. Cannot leave room.");
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
      console.log(`✅ Message sent to room ${roomId}:`, content);
    } catch (error) {
      console.error(`❌ Error sending message to room ${roomId}:`, error);
      throw error;
    }
  } else {
    console.warn("⚠️ ChatHub not connected. Cannot send message.");
    throw new Error("ChatHub not connected");
  }
}

export async function ensureChatConnected(userId, onReceiveMessage) {
  if (!chatConnection || chatConnection.state !== signalR.HubConnectionState.Connected) {
    console.log("🔄 Reconnecting ChatHub...");
    await connectChatHub(userId, onReceiveMessage);
  }
  return chatConnection;
}