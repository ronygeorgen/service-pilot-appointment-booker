import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for user operations
export const loadUsers = createAsyncThunk(
  'users/loadUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load from localStorage or return sample data
      const stored = localStorage.getItem('users');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Sample users data
      return [
        {
          id: 'user-1',
          name: 'Morgan Training',
          email: 'training@stacatruc.co.uk',
          phone: '+447432193961',
          ghlId: 'OCjXEKtBjWz583s1tDPP',
          calendarId: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-2',
          name: 'Mia Horner',
          email: 'mia@stacatruc.co.uk',
          phone: '+447384257127',
          ghlId: '0Dv2Sd5ilcu8JVeKRMbr',
          calendarId: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-3',
          name: 'Natalie Donnelly',
          email: 'rentals@knightsbridgemechanical.com',
          phone: '+447570372411',
          ghlId: '0sXLLqiSe9k2m9Ublyqp',
          calendarId: null,
          createdAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserCalendar = createAsyncThunk(
  'users/updateUserCalendar',
  async ({ userId, calendarId }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { userId, calendarId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser = {
        id: crypto.randomUUID(),
        ...userData,
        calendarId: null,
        createdAt: new Date().toISOString(),
      };
      
      return newUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Load users cases
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(state.items));
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load users';
      })
      
      // Update user calendar cases
      .addCase(updateUserCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserCalendar.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, calendarId } = action.payload;
        const index = state.items.findIndex(user => user.id === userId);
        if (index !== -1) {
          state.items[index].calendarId = calendarId;
        }
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(state.items));
      })
      .addCase(updateUserCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user calendar';
      })
      
      // Add user cases
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(state.items));
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add user';
      });
  },
});

export const { clearError, clearUsers } = userSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.items;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectUserById = (state, id) => 
  state.users.items.find(user => user.id === id);
export const selectUsersWithCalendars = (state) => 
  state.users.items.filter(user => user.calendarId);
export const selectUsersWithoutCalendars = (state) => 
  state.users.items.filter(user => !user.calendarId);

export default userSlice.reducer;