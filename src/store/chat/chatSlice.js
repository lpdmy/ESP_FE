import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rooms: [],
  messages: {},
  currentRoom: null,
  unreadCounts: {},
  onlineUsers: [],
  loading: {
    rooms: false,
    messages: false,
    sending: false,
  },
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Room actions
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
    updateRoom: (state, action) => {
      const { roomId, updates } = action.payload;
      const roomIndex = state.rooms.findIndex(room => room.id === roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...updates };
      }
    },
    removeRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
    },

    // Message actions
    setMessages: (state, action) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
    },
    addChatMessage: (state, action) => {
      const message = action.payload;
      const roomId = message.roomId || message.chatRoomId;
      
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      
      // Check if message already exists to avoid duplicates
      const existingMessage = state.messages[roomId].find(msg => msg.id === message.id);
      if (!existingMessage) {
        state.messages[roomId].push(message);
        
        // Update room's last message
        const roomIndex = state.rooms.findIndex(room => room.id === roomId);
        if (roomIndex !== -1) {
          state.rooms[roomIndex].lastMessage = message.content;
          state.rooms[roomIndex].lastMessageTime = message.timestamp || new Date().toISOString();
        }
      }
    },
    updateMessage: (state, action) => {
      const { roomId, messageId, updates } = action.payload;
      if (state.messages[roomId]) {
        const messageIndex = state.messages[roomId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[roomId][messageIndex] = { 
            ...state.messages[roomId][messageIndex], 
            ...updates 
          };
        }
      }
    },
    deleteMessage: (state, action) => {
      const { roomId, messageId } = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(msg => msg.id !== messageId);
      }
    },
    clearMessages: (state, action) => {
      const roomId = action.payload;
      state.messages[roomId] = [];
    },

    // Current room actions
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },

    // Unread count actions
    setUnreadCount: (state, action) => {
      const { roomId, count } = action.payload;
      state.unreadCounts[roomId] = count;
    },
    incrementUnreadCount: (state, action) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
    },
    clearUnreadCount: (state, action) => {
      const roomId = action.payload;
      state.unreadCounts[roomId] = 0;
    },

    // Online users actions
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
    },

    // Loading actions
    setLoading: (state, action) => {
      const { type, loading } = action.payload;
      state.loading[type] = loading;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset actions
    resetChat: (state) => {
      return initialState;
    },
  },
});

export const {
  // Room actions
  setRooms,
  addRoom,
  updateRoom,
  removeRoom,
  
  // Message actions
  setMessages,
  addChatMessage,
  updateMessage,
  deleteMessage,
  clearMessages,
  
  // Current room actions
  setCurrentRoom,
  clearCurrentRoom,
  
  // Unread count actions
  setUnreadCount,
  incrementUnreadCount,
  clearUnreadCount,
  
  // Online users actions
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  
  // Loading actions
  setLoading,
  setError,
  clearError,
  
  // Reset actions
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
