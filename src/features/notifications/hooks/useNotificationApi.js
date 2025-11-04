import { useState, useRef } from 'react';
import { executeApiCall } from '@/common/utils/executeApiCall';
import { notificationService } from '../services/notification.service';

export function useNotificationApi() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const getByUserRef = useRef(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(
      notificationService.getByUser.bind(notificationService),
      [token],
      { setLoading, setError }
    );
  });

  const markAsReadRef = useRef(async (id) => {
    const token = localStorage.getItem('token');
    return executeApiCall(
      notificationService.markAsRead.bind(notificationService),
      [id, token],
      { setLoading, setError }
    );
  });

  const addTestRef = useRef(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(
      notificationService.addTestNotification.bind(notificationService),
      [token],
      { setLoading: setSending, setError }
    );
  });

  return {
    loading,
    sending,
    error,
    getByUser: getByUserRef.current,
    markAsRead: markAsReadRef.current,
    addTestNotification: addTestRef.current,
    clearError: () => setError(null),
  };
}
