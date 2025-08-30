import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const useAuthApi = () => {
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

  const login = useCallback(async (credentials) => {
    return executeApiCall(authService.login.bind(authService), credentials);
  }, [executeApiCall]);

  const getMe = useCallback(async (token) => {
    return executeApiCall(authService.getMe.bind(authService), token);
  }, [executeApiCall]);

  const importFile = useCallback(async (file, token) => {
    return executeApiCall(authService.importFile.bind(authService), file, token);
  }, [executeApiCall]);

  const test = useCallback(async (token) => {
    return executeApiCall(authService.test.bind(authService), token);
  }, [executeApiCall]);

  return {
    loading,
    error,
    login,
    getMe,
    importFile,
    test,
    clearError: () => setError(null)
  };
};