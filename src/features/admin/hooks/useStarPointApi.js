import { useState, useCallback } from 'react';
import { starPointService } from '../services/starpoint.service';
import { executeApiCall } from '@/common/utils/executeApiCall';

export const useStarPointApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Rules
  const getAllRules = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.getAllRules.bind(starPointService), [token], { setLoading, setError });
  }, []);

  const updatePoints = useCallback(async (actionType, points) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.updatePoints.bind(starPointService), [actionType, points, token], { setLoading, setError });
  }, []);

  // Rewards
  const getAllRewards = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.getAllRewards.bind(starPointService), [token], { setLoading, setError });
  }, []);

  const getRewardById = useCallback(async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.getRewardById.bind(starPointService), [id, token], { setLoading, setError });
  }, []);

  const createReward = useCallback(async (payload) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.createReward.bind(starPointService), [payload, token], { setLoading, setError });
  }, []);

  const updateReward = useCallback(async (id, payload) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.updateReward.bind(starPointService), [id, payload, token], { setLoading, setError });
  }, []);

  const deleteReward = useCallback(async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.deleteReward.bind(starPointService), [id, token], { setLoading, setError });
  }, []);

  const redeemReward = useCallback(async (rewardId) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(
      starPointService.redeemReward.bind(starPointService),
      [rewardId, token],
      { setLoading, setError }
    );
  }, []);

  const getPointHistory = useCallback(async () => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(
      starPointService.getPointHistory.bind(starPointService),
      [token],
      { setLoading, setError }
    );
  }, []);


  const getUserPoints = useCallback(async () => {
    const token = getToken();
    return executeApiCall(starPointService.getUserPoints.bind(starPointService), [token]);
  }, []);

  const getAllRedemptionsAdmin = useCallback(async (queryParams) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.getAllRedemptionsAdmin.bind(starPointService), [queryParams, token], { setLoading, setError });
  }, []);

  const getMyRedemptions = useCallback(async (queryParams) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.getMyRedemptions.bind(starPointService), [queryParams, token], { setLoading, setError });
  }, []);

  const pickupRedemption = useCallback(async (id) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    return executeApiCall(starPointService.pickupRedemption.bind(starPointService), [id, token], { setLoading, setError });
  }, []);
  return {
    loading,
    error,
    clearError: () => setError(null),
    getAllRules,
    updatePoints,
    getAllRewards,
    getRewardById,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    getPointHistory,
    getUserPoints,
    getAllRedemptionsAdmin,
    getMyRedemptions,
    pickupRedemption
  };
};
