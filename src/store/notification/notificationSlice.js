import { createSlice } from "@reduxjs/toolkit";

// Load notifications từ localStorage nếu có
const storedNotifications = localStorage.getItem("notifications");
const initialList = storedNotifications ? JSON.parse(storedNotifications) : [];

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    count: initialList.length,
    list: initialList,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.count = state.list.length;
      // Lưu vào localStorage
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    clearNotifications: (state) => {
      state.list = [];
      state.count = 0;
      localStorage.removeItem("notifications");
    },
    loadNotificationsFromStorage: (state) => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        state.list = JSON.parse(stored);
        state.count = state.list.length;
      }
    },
  },
});

export const { addNotification, clearNotifications, loadNotificationsFromStorage } = notificationSlice.actions;
export default notificationSlice.reducer;
