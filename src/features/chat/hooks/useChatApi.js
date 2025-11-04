import { useState, useRef } from 'react';
import { executeApiCall } from '@/common/utils/executeApiCall';
import { chatService } from '../services/chat.service';

export function useChatApi() {
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to create stable function references
  const getUserRoomsRef = useRef(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(chatService.getUserRooms.bind(chatService), [token], { 
      setLoading: setRoomsLoading, 
      setError 
    });
  });

  const getRoomMessagesRef = useRef(async (roomId, limit = 50) => {
    const token = localStorage.getItem('token');
    return executeApiCall(chatService.getRoomMessages.bind(chatService), [roomId, limit, token], { 
      setLoading: setMessagesLoading, 
      setError 
    });
  });

  const createRoomRef = useRef(async (roomData) => {
    const token = localStorage.getItem('token');
    return executeApiCall(chatService.createRoom.bind(chatService), [roomData, token], { 
      setLoading: setSendLoading, 
      setError 
    });
  });

  const sendMessageRef = useRef(async (roomId, messageData) => {
    const token = localStorage.getItem('token');
    return executeApiCall(chatService.sendMessage.bind(chatService), [roomId, messageData, token], { 
      setLoading: setSendLoading, 
      setError 
    });
  });

  const markAsReadRef = useRef(async (roomId) => {
    const token = localStorage.getItem('token');
    return executeApiCall(chatService.markAsRead.bind(chatService), [roomId, token], { 
      setError 
    });
  });

  return {
    roomsLoading,
    messagesLoading,
    sendLoading,
    error,
    getUserRooms: getUserRoomsRef.current,
    getRoomMessages: getRoomMessagesRef.current,
    createRoom: createRoomRef.current,
    sendMessage: sendMessageRef.current,
    markAsRead: markAsReadRef.current,
  };
}
