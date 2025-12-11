import { ApiService } from '@/services/api.service';
import { API_CONFIG } from '@/config/api.config';

export class ChatService extends ApiService {
  // Get user's chat rooms
  async getUserRooms(token) {
    return this.get(API_CONFIG.CHAT.ROOMS, token);
  }

  // Get messages for a specific room
  async getRoomMessages(roomId, limit = 50, token) {
    const endpoint = API_CONFIG.CHAT.GET_MESSAGES.replace('{roomId}', roomId);
    return this.get(`${endpoint}?limit=${limit}`, token);
  }

  // Create a new chat room
  async createRoom(roomData, token) {
    return this.post(API_CONFIG.CHAT.ROOMS, roomData, token);
  }

  // Send a message to a room
  async sendMessage(roomId, messageData, token) {
    const endpoint = API_CONFIG.CHAT.MESSAGES;
    return this.post(`${endpoint}/${roomId}`, messageData, token);
  }

  async markAsRead(roomId, token) {
    const endpoint = API_CONFIG.CHAT.MARK_AS_READ.replace('{roomId}', roomId);
    return this.post(endpoint, null, token);
  }
}

export const chatService = new ChatService();
