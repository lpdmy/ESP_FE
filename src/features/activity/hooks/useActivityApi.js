import { useState, useCallback } from 'react';
import { executeApiCall } from '@/common/utils/executeApiCall';
import { ActivityService } from '../services/activity.service';

export function useActivityApi() {
  const activityService = new ActivityService();
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllActivity = useCallback(
    async (pageNumber = 1, pageSize = 10, search = null) => {
      const token = localStorage.getItem('token');
      return executeApiCall(
        activityService.getAllActivities.bind(activityService), // chú ý service phải có getAllActivities
        [pageNumber, pageSize, search, token],
        { setLoading: setActivityLoading, setError }
      );
    },
    [activityService]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    activityLoading,
    error,
    getAllActivity,
    clearError,
  };
}
