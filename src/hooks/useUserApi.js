import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';

export const useUserApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeApiCall = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllUsers = useCallback(async (token) => {
    return executeApiCall(userService.getAllUsers.bind(userService), token);
  }, [executeApiCall]);

  const getUserById = useCallback(async (id, token) => {
    return executeApiCall(userService.getUserById.bind(userService), id, token);
  }, [executeApiCall]);

  const createUser = useCallback(async (userData, token) => {
    return executeApiCall(userService.createUser.bind(userService), userData, token);
  }, [executeApiCall]);

  const updateUser = useCallback(async (id, userData, token) => {
    return executeApiCall(userService.updateUser.bind(userService), id, userData, token);
  }, [executeApiCall]);

  const deleteUser = useCallback(async (id, token) => {
    return executeApiCall(userService.deleteUser.bind(userService), id, token);
  }, [executeApiCall]);

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