import { toast } from "react-toastify";
import { connectChatHub } from "./chatHub";
import { MessageSquare } from "lucide-react";
import { addChatMessage } from "@/store/chat/chatSlice";

/**
 * Khởi tạo kết nối Chat SignalR và hiển thị toast khi có tin nhắn mới
 * @param {number} userId
 * @param {function} dispatch
 * @param {(message: any) => void} onNewMessage
 */
export async function initGlobalChat(userId, dispatch, onNewMessage) {
  if (!userId || window.__chatHubConnected) return;

  window.__chatHubConnected = true;

  try {
    await connectChatHub(userId, (message) => {
      if (message.senderId === userId) return; 

      // Transform backend message format to frontend format
      const transformedMessage = {
        id: message.id,
        content: message.content,
        type: message.type || "text",
        sender: message.senderId === userId ? "me" : "friend",
        timestamp: new Date(message.timestamp),
        roomId: message.roomId,
        senderId: message.senderId,
        senderName: message.senderName || "Unknown User",
        senderAvatar: message.senderAvatar || "/placeholder.svg",
      };

      onNewMessage?.(transformedMessage);
      dispatch(addChatMessage(transformedMessage));

      toast.info(`💬 ${transformedMessage.senderName}: ${transformedMessage.content}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        theme: "colored",
        icon: <MessageSquare className="w-5 h-5 text-white" />,
        style: {
          background: "#007bff",
          color: "#fff",
          fontWeight: "500",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
      });
    });
  } catch (err) {
    console.error("ChatHub init error:", err);
    window.__chatHubConnected = false;
  }
}
