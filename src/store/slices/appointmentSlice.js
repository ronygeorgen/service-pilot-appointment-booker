import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for appointment operations
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (appointmentData.isRecurring) {
        return generateRecurringAppointments(appointmentData);
      } else {
        const appointment = {
          id: Math.floor(1000000 + Math.random() * 9000000),
          ...appointmentData,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        };
        return [appointment];
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecurringSeries = createAsyncThunk(
  'appointments/deleteRecurringSeries',
  async (recurringId, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return recurringId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadAppointments = createAsyncThunk(
  'appointments/loadAppointments',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage or return empty array
      const stored = localStorage.getItem('appointments');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to generate recurring appointments
const generateRecurringAppointments = (appointmentData) => {
  const appointments = [];
  const baseDate = new Date(appointmentData.date);
  const recurringId = Math.floor(1000000 + Math.random() * 9000000);
  const { recurringPattern } = appointmentData;

  for (let i = 0; i < recurringPattern.repeatCount; i++) {
    const appointmentDate = new Date(baseDate);
    
    switch (recurringPattern.frequency) {
      case 'daily':
        appointmentDate.setDate(baseDate.getDate() + (i * recurringPattern.interval));
        break;
      case 'weekly':
        appointmentDate.setDate(baseDate.getDate() + (i * recurringPattern.interval * 7));
        break;
      case 'monthly':
        appointmentDate.setMonth(baseDate.getMonth() + (i * recurringPattern.interval));
        break;
    }

    appointments.push({
      id: Math.floor(1000000 + Math.random() * 9000000),
      title: appointmentData.title,
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentData.time,
      assignedPeople: [...appointmentData.assignedPeople],
      isRecurring: true,
      recurringId,
      recurringPattern,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    });
  }

  return appointments;
};

const appointmentSlice = createSlice({
  name: 'appointments',
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
    clearAppointments: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
    // Optimistic updates for better UX
    optimisticUpdateAppointment: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(apt => apt.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create appointment cases
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(...action.payload);
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(state.items));
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create appointment';
      })
      
      // Update appointment cases
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.items.findIndex(apt => apt.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(state.items));
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update appointment';
      })
      
      // Delete appointment cases
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(apt => apt.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(state.items));
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete appointment';
      })
      
      // Delete recurring series cases
      .addCase(deleteRecurringSeries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecurringSeries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(apt => apt.recurringId !== action.payload);
        state.lastUpdated = new Date().toISOString();
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(state.items));
      })
      .addCase(deleteRecurringSeries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete recurring series';
      })
      
      // Load appointments cases
      .addCase(loadAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load appointments';
      });
  },
});

export const { clearError, clearAppointments, optimisticUpdateAppointment } = appointmentSlice.actions;

// Selectors
export const selectAllAppointments = (state) => state.appointments.items;
export const selectAppointmentsLoading = (state) => state.appointments.loading;
export const selectAppointmentsError = (state) => state.appointments.error;
export const selectAppointmentById = (state, id) => 
  state.appointments.items.find(apt => apt.id === id);
export const selectRecurringGroups = (state) => {
  const recurringGroups = {};
  const singleAppointments = [];

  state.appointments.items.forEach(appointment => {
    if (appointment.isRecurring && appointment.recurringId) {
      if (!recurringGroups[appointment.recurringId]) {
        const firstAppointment = state.appointments.items
          .filter(a => a.recurringId === appointment.recurringId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        
        recurringGroups[appointment.recurringId] = {
          id: appointment.recurringId,
          title: appointment.title,
          pattern: appointment.recurringPattern,
          appointments: [],
          assignedPeople: appointment.assignedPeople,
          createdAt: firstAppointment.createdAt,
        };
      }
      recurringGroups[appointment.recurringId].appointments.push(appointment);
    } else {
      singleAppointments.push(appointment);
    }
  });

  // Sort appointments within each group
  Object.values(recurringGroups).forEach(group => {
    group.appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return { recurringGroups, singleAppointments };
};

export default appointmentSlice.reducer;