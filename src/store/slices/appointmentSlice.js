import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { 
  createAppointmentService, 
  searchContactsService, 
  searchPeopleService,
  getRecurringGroups,
  getRecurringGroupAppointments,
  deleteRecurringGroup,
  deleteSingleAppointment,
  getAllRecurringAppointments
} from '../../services/appointments_services';


export const deleteSingleAppointmentAPI = createAsyncThunk(
  'appointments/deleteSingleAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await deleteSingleAppointment(appointmentId);
      return {
        // Return both the API ID and the ghl_appointment_id for reference
        api_id: response.appointment_id,  // The numeric ID (118)
        ghl_id: response.ghl_appointment_id // The string ID (poNkaT7wDbWkfKWfzSgu)
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Add new async thunk for loading all recurring appointments
export const loadAllRecurringAppointments = createAsyncThunk(
  'appointments/loadAllRecurringAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const allRecurring = await getAllRecurringAppointments();
      return allRecurring;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for contacts and people search
export const searchContacts = createAsyncThunk(
  'contacts/searchContacts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchContactsService(query);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data || 'Failed to fetch contacts');
    }
  }
);

export const searchPeople = createAsyncThunk(
  'appointments/searchPeople',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchPeopleService(query);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch people');
    }
  }
);

// Async thunks for appointment operations
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await createAppointmentService(appointmentData);
      return response.data;
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

// New API-integrated async thunks
export const fetchRecurringGroups = createAsyncThunk(
  'appointments/fetchRecurringGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRecurringGroups();
      return response.results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecurringGroupAppointments = createAsyncThunk(
  'appointments/fetchRecurringGroupAppointments',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await getRecurringGroupAppointments(groupId);
      return { 
        groupId, 
        appointments: response.results,
        count: response.count // Include the count
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecurringSeries = createAsyncThunk(
  'appointments/deleteRecurringSeries',
  async (groupId, { rejectWithValue }) => {
    try {
      await deleteRecurringGroup(groupId);
      return groupId;
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
      success: false,
    });
  }

  return appointments;
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    contacts: [],
    contactsSearchLoading: false,
    peopleSuggestions: [],
    peopleSuggestionsLoading: false,
    items: [],
    loading: false,
    error: null,
    lastUpdated: null,
    recurringGroups: [],
    loadedGroupAppointments: {},
  },
  reducers: {
    clearContacts: (state) => {
      state.contacts = [];
    },
    clearPeopleSuggestions: (state) => {
      state.peopleSuggestions = [];
    },
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
      .addCase(deleteSingleAppointmentAPI.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteSingleAppointmentAPI.fulfilled, (state, action) => {
          state.loading = false;
          const deletedId = action.payload.api_id; // Use the numeric ID (118)
          
          // Remove from items if it exists there
          state.items = state.items.filter(item => item.id !== deletedId);
          
          // Remove from any loaded group appointments
          Object.keys(state.loadedGroupAppointments).forEach(groupId => {
            state.loadedGroupAppointments[groupId] = 
              state.loadedGroupAppointments[groupId].filter(
                apt => apt.id !== deletedId
              );
          });
        })
        .addCase(deleteSingleAppointmentAPI.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        
        // Handle loading all recurring appointments
        .addCase(loadAllRecurringAppointments.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(loadAllRecurringAppointments.fulfilled, (state, action) => {
          state.loading = false;
          state.allRecurringAppointmentsLoaded = true;
          
          action.payload.forEach(({ group, appointments }) => {
            // Store the group if not already present
            if (!state.recurringGroups.some(g => g.group_id === group.group_id)) {
              state.recurringGroups.push(group);
            }
            
            // Store the appointments
            state.loadedGroupAppointments[group.group_id] = appointments;
          });
        })
        .addCase(loadAllRecurringAppointments.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
      // Create appointment cases
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.appointments) {
          state.items.push(...action.payload.appointments);
        } else {
          state.items.push(action.payload);
        }
        state.lastUpdated = new Date().toISOString();
        state.success = true;
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
        localStorage.setItem('appointments', JSON.stringify(state.items));
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete appointment';
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
      })

      // Search contacts cases
      .addCase(searchContacts.pending, (state) => {
        state.contactsSearchLoading = true;
        state.error = null;
      })
      .addCase(searchContacts.fulfilled, (state, action) => {
        state.contactsSearchLoading = false;
        state.contacts = action.payload?.results || [];
      })
      .addCase(searchContacts.rejected, (state, action) => {
        state.contactsSearchLoading = false;
        state.error = action.payload;
      })

      // Search people cases
      .addCase(searchPeople.pending, (state) => {
        state.peopleSuggestionsLoading = true;
        state.error = null;
      })
      .addCase(searchPeople.fulfilled, (state, action) => {
        state.peopleSuggestionsLoading = false;
        state.peopleSuggestions = action.payload?.results || [];
      })
      .addCase(searchPeople.rejected, (state, action) => {
        state.peopleSuggestionsLoading = false;
        state.error = action.payload;
      })

      // Fetch recurring groups cases
      .addCase(fetchRecurringGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.recurringGroups = action.payload || [];
      })
      .addCase(fetchRecurringGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recurring group appointments cases
      .addCase(fetchRecurringGroupAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringGroupAppointments.fulfilled, (state, action) => {
        state.loading = false;
        const { groupId, appointments, count } = action.payload;
        state.loadedGroupAppointments[groupId] = {
          items: appointments,
          count: count // Store the count
        };
      })
      .addCase(fetchRecurringGroupAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete recurring series cases
      .addCase(deleteRecurringSeries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecurringSeries.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted group from state
        state.recurringGroups = state.recurringGroups.filter(
          group => group.group_id !== action.payload
        );
        // Remove any loaded appointments for this group
        delete state.loadedGroupAppointments[action.payload];
      })
      .addCase(deleteRecurringSeries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearAppointments, 
  optimisticUpdateAppointment, 
  clearContacts, 
  clearPeopleSuggestions 
} = appointmentSlice.actions;


// Memoized selectors
const selectAppointmentsState = state => state.appointments;
export const selectAllAppointments = createSelector(
  [selectAppointmentsState],
  (appointments) => appointments.items
);

export const selectAppointmentsLoading = createSelector(
  [selectAppointmentsState],
  (appointments) => appointments.loading
);

export const selectAppointmentsError = createSelector(
  [selectAppointmentsState],
  (appointments) => appointments.error
);

export const selectAppointmentById = createSelector(
  [selectAllAppointments, (_, id) => id],
  (appointments, id) => appointments.find(apt => apt.id === id)
);

export const selectRecurringGroups = createSelector(
  [selectAppointmentsState],
  (appointments) => {
    const recurringGroups = {};
    const singleAppointments = [];

    // Process API-loaded recurring groups
    appointments.recurringGroups.forEach(group => {
      const groupData = appointments.loadedGroupAppointments[group.group_id] || {};
      
      // Create a new array for sorted appointments to avoid mutating state
      const sortedAppointments = [...groupData].sort((a, b) => {
        const dateA = a.start_time ? new Date(a.start_time) : new Date(a.date);
        const dateB = b.start_time ? new Date(b.start_time) : new Date(b.date);
        return dateA - dateB;
      });

      recurringGroups[group.group_id] = {
        id: group.group_id,
        title: group.title,
        description: group.description,
        pattern: {
          frequency: group.interval,
          interval: 1,
          repeatCount: group.total_count
        },
        appointments: sortedAppointments,
        appointments_count: groupData.count,
        assignedPeople: [group.contact_id],
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        isActive: group.is_active,
        appointments_count: group.appointments_count
      };
    });

    // Process locally generated recurring appointments
    appointments.items.forEach(appointment => {
      if (appointment.isRecurring && appointment.recurringId) {
        if (!recurringGroups[appointment.recurringId]) {
          recurringGroups[appointment.recurringId] = {
            id: appointment.recurringId,
            title: appointment.title,
            pattern: appointment.recurringPattern,
            appointments: [],
            assignedPeople: appointment.assignedPeople,
            createdAt: appointment.createdAt
          };
        }
        // Create a new array with the new appointment added
        recurringGroups[appointment.recurringId].appointments = [
          ...recurringGroups[appointment.recurringId].appointments,
          appointment
        ];
      } else if (!appointment.isRecurring) {
        singleAppointments.push(appointment);
      }
    });

    // Sort single appointments
    const sortedSingleAppointments = [...singleAppointments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { 
      recurringGroups, 
      singleAppointments: sortedSingleAppointments 
    };
  }
);

export default appointmentSlice.reducer;