import { useSelector, useDispatch } from 'react-redux';
import { 
  setActivity, 
  updateActivity,
  setLoading, 
  setError, 
  clearError,
  removeActivity,
  clearAllActivities,
  setActivities
} from './activitySlice';
import { activityService } from '@/features/activities/services/activity.service';

export function useActivityStore() {
  const dispatch = useDispatch();
  const activityState = useSelector(state => state.activity);

  // Helper to check if activity is cached and still valid
  const isCached = (id) => {
    if (!activityState.activities[id]) return false;
    const lastFetched = activityState.lastFetched[id];
    if (!lastFetched) return false;
    const age = Date.now() - lastFetched;
    return age < activityState.cacheTTL;
  };

  // Get activity from cache or fetch if not cached/expired
  const getActivity = async (id, forceRefresh = false) => {
    // Return cached data if available and not expired
    if (!forceRefresh && isCached(id)) {
      return activityState.activities[id];
    }

    // Check if already loading
    if (activityState.loading[id]) {
      // Wait a bit and return cached data if available
      return activityState.activities[id] || null;
    }

    // Set loading state
    dispatch(setLoading({ id, loading: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await activityService.getActivityById(id, token);
      
      if (response?.data) {
        dispatch(setActivity({ id, data: response.data }));
        return response.data;
      } else {
        throw new Error('Activity data not found');
      }
    } catch (error) {
      dispatch(setError({ id, error: error.message || 'Failed to fetch activity' }));
      // Return cached data if available even on error
      return activityState.activities[id] || null;
    }
  };

  // Get activity from cache only (no fetch)
  const getCachedActivity = (id) => {
    return activityState.activities[id] || null;
  };

  // Check if activity is loading
  const isLoading = (id) => {
    return activityState.loading[id] || false;
  };

  // Check if activity has error
  const getError = (id) => {
    return activityState.errors[id] || null;
  };

  return {
    // State
    activities: activityState.activities,
    loading: activityState.loading,
    errors: activityState.errors,
    lastFetched: activityState.lastFetched,
    
    // Actions
    setActivity: (id, data) => dispatch(setActivity({ id, data })),
    updateActivity: (id, updates) => dispatch(updateActivity({ id, updates })),
    setLoading: (id, loading) => dispatch(setLoading({ id, loading })),
    setError: (id, error) => dispatch(setError({ id, error })),
    clearError: (id) => dispatch(clearError(id)),
    removeActivity: (id) => dispatch(removeActivity(id)),
    clearAllActivities: () => dispatch(clearAllActivities()),
    setActivities: (activities) => dispatch(setActivities(activities)),
    
    // Helpers
    getActivity,
    getCachedActivity,
    isLoading,
    getError,
    isCached,
  };
}






