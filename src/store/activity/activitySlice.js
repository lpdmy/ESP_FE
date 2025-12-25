import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Cache activities by ID: { [activityId]: activityData }
  activities: {},
  // Loading states by activity ID: { [activityId]: boolean }
  loading: {},
  // Error states by activity ID: { [activityId]: errorMessage }
  errors: {},
  // Timestamp when activity was last fetched: { [activityId]: timestamp }
  lastFetched: {},
  // Cache TTL in milliseconds (default: 5 minutes)
  cacheTTL: 5 * 60 * 1000,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    // Set activity data
    setActivity: (state, action) => {
      const { id, data } = action.payload;
      state.activities[id] = data;
      state.lastFetched[id] = Date.now();
      state.loading[id] = false;
      state.errors[id] = null;
    },

    // Update activity data (partial update)
    updateActivity: (state, action) => {
      const { id, updates } = action.payload;
      if (state.activities[id]) {
        state.activities[id] = { ...state.activities[id], ...updates };
        state.lastFetched[id] = Date.now();
      }
    },

    // Set loading state for specific activity
    setLoading: (state, action) => {
      const { id, loading } = action.payload;
      state.loading[id] = loading;
      if (loading) {
        state.errors[id] = null;
      }
    },

    // Set error state for specific activity
    setError: (state, action) => {
      const { id, error } = action.payload;
      state.errors[id] = error;
      state.loading[id] = false;
    },

    // Clear error for specific activity
    clearError: (state, action) => {
      const id = action.payload;
      state.errors[id] = null;
    },

    // Remove activity from cache
    removeActivity: (state, action) => {
      const id = action.payload;
      delete state.activities[id];
      delete state.loading[id];
      delete state.errors[id];
      delete state.lastFetched[id];
    },

    // Clear all activities from cache
    clearAllActivities: (state) => {
      state.activities = {};
      state.loading = {};
      state.errors = {};
      state.lastFetched = {};
    },

    // Set multiple activities at once (useful for list views)
    setActivities: (state, action) => {
      const activities = action.payload;
      activities.forEach((activity) => {
        if (activity?.id) {
          state.activities[activity.id] = activity;
          state.lastFetched[activity.id] = Date.now();
        }
      });
    },
  },
});

export const {
  setActivity,
  updateActivity,
  setLoading,
  setError,
  clearError,
  removeActivity,
  clearAllActivities,
  setActivities,
} = activitySlice.actions;

export default activitySlice.reducer;







