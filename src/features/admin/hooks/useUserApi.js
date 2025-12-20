import { useState, useCallback } from 'react';
import { userService } from '../services/user.service';
import { executeApiCall } from '@/common/utils/executeApiCall';

export const useUserApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // const getAllUsers = useCallback(async (token) => {
  //   return executeApiCall(userService.getAllUsers.bind(userService), [token], { setLoading, setError });
  // }, []);

  const getAllUsers = useCallback(
    async (pageNumber = 1, pageSize = 10, search = null, status = null, role = null, sortField = null, sortDirection = null) => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      return executeApiCall(
        userService.getAllUsers.bind(userService), 
        [pageNumber, pageSize, search, status, role, sortField, sortDirection, token],
        { setLoading, setError }
      );
    },
    []
  );

  const getUserById = useCallback(async (id, token) => {
    return executeApiCall(userService.getUserById.bind(userService), [id, token], { setLoading, setError });
  }, []);

  const createUser = useCallback(async (userData, token) => {
    return executeApiCall(userService.createUser.bind(userService), [userData, token], { setLoading, setError });
  }, []);

  const updateUser = useCallback(async (userData, token) => {
    return executeApiCall(userService.updateUser.bind(userService), [userData, token], { setLoading, setError });
  }, []);

  const deleteUser = useCallback(async (id, token) => {
    return executeApiCall(userService.deleteUser.bind(userService), [id, token], { setLoading, setError });
  }, []);

  const getUserStatistics = useCallback(async (token) => {
    return executeApiCall(userService.getUserStatistics.bind(userService), [token], { setLoading, setError });
  }, []);

  return {
    loading,
    error,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserStatistics,
    clearError: () => setError(null)
  };
};