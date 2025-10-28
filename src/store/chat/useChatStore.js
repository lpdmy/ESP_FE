import { useSelector, useDispatch } from 'react-redux';
import { 
  setRooms, 
  addRoom, 
  updateRoom, 
  removeRoom,
  setMessages, 
  addChatMessage, 
  updateMessage, 
  deleteMessage, 
  clearMessages,
  setCurrentRoom, 
  clearCurrentRoom,
  setUnreadCount, 
  incrementUnreadCount, 
  clearUnreadCount,
  setOnlineUsers, 
  addOnlineUser, 
  removeOnlineUser,
  setLoading, 
  setError, 
  clearError,
  resetChat 
} from './chatSlice';

export function useChatStore() {
  const dispatch = useDispatch();
  const chatState = useSelector(state => state.chat);

  return {
    // State
    ...chatState,
    
    // Room actions
    setRooms: (rooms) => dispatch(setRooms(rooms)),
    addRoom: (room) => dispatch(addRoom(room)),
    updateRoom: (roomId, updates) => dispatch(updateRoom({ roomId, updates })),
    removeRoom: (roomId) => dispatch(removeRoom(roomId)),
    
    // Message actions
    setMessages: (roomId, messages) => dispatch(setMessages({ roomId, messages })),
    addChatMessage: (message) => dispatch(addChatMessage(message)),
    updateMessage: (roomId, messageId, updates) => dispatch(updateMessage({ roomId, messageId, updates })),
    deleteMessage: (roomId, messageId) => dispatch(deleteMessage({ roomId, messageId })),
    clearMessages: (roomId) => dispatch(clearMessages(roomId)),
    
    // Current room actions
    setCurrentRoom: (room) => dispatch(setCurrentRoom(room)),
    clearCurrentRoom: () => dispatch(clearCurrentRoom()),
    
    // Unread count actions
    setUnreadCount: (roomId, count) => dispatch(setUnreadCount({ roomId, count })),
    incrementUnreadCount: (roomId) => dispatch(incrementUnreadCount(roomId)),
    clearUnreadCount: (roomId) => dispatch(clearUnreadCount(roomId)),
    
    // Online users actions
    setOnlineUsers: (users) => dispatch(setOnlineUsers(users)),
    addOnlineUser: (userId) => dispatch(addOnlineUser(userId)),
    removeOnlineUser: (userId) => dispatch(removeOnlineUser(userId)),
    
    // Loading actions
    setLoading: (type, loading) => dispatch(setLoading({ type, loading })),
    setError: (error) => dispatch(setError(error)),
    clearError: () => dispatch(clearError()),
    
    // Reset actions
    resetChat: () => dispatch(resetChat()),
  };
}
