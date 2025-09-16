import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import { executeApiCall } from '@/common/utils/executeApiCall';

export const useUserApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllUsers = useCallback(async (token) => {
    return executeApiCall(userService.getAllUsers.bind(userService), [token], { setLoading, setError });
  }, []);

  const getUserById = useCallback(async (id, token) => {
    return executeApiCall(userService.getUserById.bind(userService), [id, token], { setLoading, setError });
  }, []);

  const createUser = useCallback(async (userData, token) => {
    return executeApiCall(userService.createUser.bind(userService), [userData, token], { setLoading, setError });
  }, []);

  const updateUser = useCallback(async (id, userData, token) => {
    return executeApiCall(userService.updateUser.bind(userService), [id, userData, token], { setLoading, setError });
  }, []);

  const deleteUser = useCallback(async (id, token) => {
    return executeApiCall(userService.deleteUser.bind(userService), [id, token], { setLoading, setError });
  }, []);

  return {
    loading,
    error,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    clearError: () => setError(null)
  };
};