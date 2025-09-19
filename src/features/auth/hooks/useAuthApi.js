import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { executeApiCall } from '@/common/utils/executeApiCall';

export const useAuthApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    return executeApiCall(authService.login.bind(authService), [credentials], { setLoading, setError });
  }, []);

  const getMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    return executeApiCall(authService.getMe.bind(authService), [token], { setLoading, setError });
  }, []);

  const importFile = useCallback(async (file) => {
    return executeApiCall(authService.importFile.bind(authService), [file], { setLoading, setError });
  }, []);

  const oneTimeLogin = useCallback(async (token) => {
    return executeApiCall(authService.oneTimeLogin.bind(authService), [token], { setLoading, setError });
  }, []);

  const changePasswordOtl = useCallback(async (request) => {
    return executeApiCall(authService.changePasswordOtl.bind(authService), [request], { setLoading, setError });
  }, []);

  const changePassword = useCallback(async (request) => {
    return executeApiCall(authService.changePassword.bind(authService), [request], { setLoading, setError });
  }, []);

  const forgotPassword = useCallback(async (request) => {
    return executeApiCall(authService.forgotPassword.bind(authService), [request], { setLoading, setError });
  }, []);

  const createUser = useCallback(async (request) => {
    return executeApiCall(authService.createUser.bind(authService), [request], { setLoading, setError });
  }, []);

  const test = useCallback(async () => {
    return executeApiCall(authService.test.bind(authService), [], { setLoading, setError });
  }, []);

  return {
    loading,
    error,
    login,
    getMe,
    importFile,
    test,
    oneTimeLogin,
    changePasswordOtl,
    changePassword,
    forgotPassword,
    createUser,
    clearError: () => setError(null)
  };
};