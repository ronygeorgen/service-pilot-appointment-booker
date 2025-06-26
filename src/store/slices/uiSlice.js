import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'create',
    showSettings: false,
    notifications: [],
    theme: 'light',
    sidebarCollapsed: false,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    setShowSettings: (state, action) => {
      state.showSettings = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Math.floor(1000000 + Math.random() * 9000000),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const {
  setActiveTab,
  toggleSettings,
  setShowSettings,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleSidebar,
} = uiSlice.actions;

// Selectors
export const selectActiveTab = (state) => state.ui.activeTab;
export const selectShowSettings = (state) => state.ui.showSettings;
export const selectNotifications = (state) => state.ui.notifications;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;

export default uiSlice.reducer;