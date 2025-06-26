import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';

export const loadUsers = createAsyncThunk(
  'users/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/accounts/calendar-stats/');
      // Return the all_users array from the stats object
      return response.data.stats.all_users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load users');
    }
  }
);

export const updateUserCalendar = createAsyncThunk(
  'users/updateUserCalendar',
  async ({ userId, calendarId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/accounts/users/${userId}/update-calendar/`,
        { calendar_id: calendarId }
      );
      
      // Return both the userId and the updated calendar_id from the response
      return { 
        userId, 
        calendarId: response.data.calendar_id || calendarId 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update calendar');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserCalendar.fulfilled, (state, action) => {
      state.loading = false;
      const { userId, calendarId } = action.payload;
      
      // Find and update the specific user
      const userIndex = state.items.findIndex(user => user.user_id === userId);
      if (userIndex !== -1) {
        state.items[userIndex].calendar_id = calendarId;
      }
    })
      .addCase(updateUserCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = userSlice.actions;

export const selectAllUsers = (state) => state.users.items;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default userSlice.reducer;