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
      const notification = action.payload;
      // Kiểm tra xem notification đã tồn tại chưa (tránh trùng lặp)
      const exists = state.list.some((n) => n.id === notification.id);
      if (!exists) {
        state.list.unshift(notification);
        // Đếm số lượng thông báo chưa đọc
        state.count = state.list.filter((n) => !n.read).length;
        // Lưu vào localStorage
        localStorage.setItem("notifications", JSON.stringify(state.list));
      }
    },
    clearNotifications: (state) => {
      state.list = [];
      state.count = 0;
      localStorage.removeItem("notifications");
    },
    loadNotificationsFromStorage: (state) => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        try {
          state.list = JSON.parse(stored);
          // Đếm số lượng thông báo chưa đọc
          state.count = state.list.filter((n) => !n.read).length;
        } catch (error) {
          console.error("Error loading notifications from storage:", error);
          state.list = [];
          state.count = 0;
        }
      }
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.list.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        // Cập nhật lại số lượng thông báo chưa đọc
        state.count = state.list.filter((n) => !n.read).length;
        localStorage.setItem("notifications", JSON.stringify(state.list));
      }
    },
  },
});

export const { addNotification, clearNotifications, loadNotificationsFromStorage, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
