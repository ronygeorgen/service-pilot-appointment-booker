import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Edit3, Trash2, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectRecurringGroups,
  selectAppointmentsLoading,
  updateAppointment,
  deleteAppointment,
  deleteRecurringSeries,
  optimisticUpdateAppointment,
  fetchRecurringGroups,
  fetchRecurringGroupAppointments,
  deleteSingleAppointmentAPI,
  loadAllRecurringAppointments,
  loadAllSingleAppointments
} from '../store/slices/appointmentSlice';
import { addNotification } from '../store/slices/uiSlice';

export const AppointmentManager = () => {
  const dispatch = useAppDispatch();
  const { recurringGroups, singleAppointments } = useAppSelector(selectRecurringGroups);
  const {allsingleAppointments, singlePagination  } = useAppSelector(state=>state.appointments)
  const loading = useAppSelector(selectAppointmentsLoading);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Load recurring groups on component mount
  useEffect(() => {
    dispatch(loadAllRecurringAppointments());
    dispatch(loadAllSingleAppointments());
    dispatch(fetchRecurringGroups());
  }, [dispatch]);

  const toggleGroupExpansion = async (groupId) => {
    const newExpanded = new Set(expandedGroups);
    
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      // Only fetch if we haven't loaded this group's appointments yet
      if (!recurringGroups[groupId]?.appointments?.length) {
        await dispatch(fetchRecurringGroupAppointments(groupId));
      }
      newExpanded.add(groupId);
    }
    
    setExpandedGroups(newExpanded);
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setEditForm({
      title: appointment.title,
      date: appointment.date,
      time: appointment.time,
      assignedPeople: appointment.assignedPeople,
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      try {
        await dispatch(updateAppointment({ id: editingId, updates: editForm })).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          message: 'Appointment updated successfully'
        }));
        
        setEditingId(null);
        setEditForm({});
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to update appointment'
        }));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdateAppointment = async (id, updates) => {
    // Optimistic update for better UX
    dispatch(optimisticUpdateAppointment({ id, updates }));
    
    try {
      await dispatch(updateAppointment({ id, updates })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: `Appointment ${updates.status === 'completed' ? 'completed' : 'updated'}`
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update appointment'
      }));
    }
  };

 const handleDeleteAppointment = async (id, isRecurring = false) => {
    // if (isRecurring) {
    //   if (window.confirm('Are you sure you want to delete this entire recurring series?')) {
    //     try {
    //       await dispatch(deleteRecurringSeries(id)).unwrap();
    //       dispatch(addNotification({
    //         type: 'success',
    //         message: 'Recurring series deleted successfully'
    //       }));
    //     } catch (error) {
    //       dispatch(addNotification({
    //         type: 'error',
    //         message: error || 'Failed to delete recurring series'
    //       }));
    //     }
    //   }
    // } else {
      if (window.confirm('Are you sure you want to delete this appointment?')) {
        try {
          await dispatch(deleteSingleAppointmentAPI(id)).unwrap();
          dispatch(addNotification({
            type: 'success',
            message: 'Appointment deleted successfully'
          }));
        } catch (error) {
          dispatch(addNotification({
            type: 'error',
            message: error || 'Failed to delete appointment'
          }));
        }
      }
    // }
  };

  const handleDeleteRecurringSeries = async (recurringId) => {
    if (window.confirm('Are you sure you want to delete this entire recurring series? This will delete all appointments in the series.')) {
      try {
        await dispatch(deleteRecurringSeries(recurringId)).unwrap();
        dispatch(fetchRecurringGroups()); // Refresh the list
        
        dispatch(addNotification({
          type: 'success',
          message: 'Recurring series deleted successfully'
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to delete recurring series'
        }));
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

const formatTime = (timeString) => {
  if (!timeString) return 'No time set';
  
  try {
    // Handle both "HH:MM" format and ISO time strings
    const [hours, minutes] = timeString.includes('T') 
      ? timeString.split('T')[1].substring(0, 5).split(':')
      : timeString.split(':');
    
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAppointmentCard = (appointment, isInGroup = false) => (
    <div 
      key={appointment.id}
      className={`border rounded-lg p-4 ${isInGroup ? 'border-gray-200 bg-gray-50' : 'border-gray-300'} hover:shadow-md transition-all`}
    >
      {editingId === appointment.id ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editForm.title || ''}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Appointment title"
            disabled={loading}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={editForm.date || ''}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="time"
              value={editForm.time || ''}
              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 text-lg">{appointment.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(appointment.adjusted_start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(appointment.adjusted_start_time)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">{appointment.assigned_user_name}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {/* <button
              onClick={() => handleEdit(appointment)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleUpdateAppointment(appointment.id, { 
                status: appointment.status === 'completed' ? 'scheduled' : 'completed' 
              })}
              disabled={loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                appointment.status === 'completed' 
                  ? 'text-gray-600 hover:bg-gray-50' 
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {appointment.status === 'completed' ? 'Undo' : 'Complete'}
            </button> */}
            <button
              onClick={() => handleDeleteAppointment(
                appointment.id, 
                isInGroup
              )}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isInGroup ? 'Delete This Occurrence' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderRecurringGroup = (group) => {
    const isExpanded = expandedGroups.has(group.id);
    const completedCount = group.appointments.filter(apt => apt.status === 'completed').length;
    
    return (
      <div key={group.id} className="bg-white rounded-xl shadow-lg border border-blue-200">
        <div 
          className="p-6 cursor-pointer hover:bg-blue-50 transition-colors rounded-t-xl"
          onClick={() => toggleGroupExpansion(group.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {group.pattern.frequency} every {group.pattern.interval} 
                    {group.pattern.frequency === 'daily' ? ' day(s)' : 
                     group.pattern.frequency === 'weekly' ? ' week(s)' : ' month(s)'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {Array.isArray(group.assignedPeople) ? group.assignedPeople.join(', ') : group.assignedPeople}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {group.appointments_count} appointments
              </span>
              {completedCount > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {completedCount} completed
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRecurringSeries(group.id);
                }}
                disabled={loading}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                Delete Series
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-6 pb-6 space-y-3 border-t border-gray-100">
            {group.appointments.map(appointment => renderAppointmentCard({
              ...appointment,
              id: appointment.id,
              date: appointment.adjusted_start_time ? appointment.adjusted_start_time.split('T')[0] : appointment.date,
              time: appointment.adjusted_start_time ? appointment.adjusted_start_time.split('T')[1].substring(0, 5) : appointment.time,
              assignedPeople: appointment.assigned_to || appointment.assignedPeople,
              status: appointment.status || 'scheduled',
              recurringId: group.id
            }, true))}
          </div>
        )}
      </div>
    );
  };

  const handleNextSinglePage = () => {
    if (singlePagination.next) {
      dispatch(loadAllSingleAppointments(singlePagination.next));
    }
  };

  const handlePreviousSinglePage = () => {
    if (singlePagination.previous) {
      dispatch(loadAllSingleAppointments(singlePagination.previous));
    }
  };

  const totalAppointments = allsingleAppointments?.length + 
    Object.values(recurringGroups).reduce((sum, group) => sum + group.appointments.length, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Calendar className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Manage Appointments</h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {totalAppointments} total appointments
        </span>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Recurring Groups */}
        {Object.values(recurringGroups).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recurring Appointments</h3>
            <div className="space-y-4">
              {Object.values(recurringGroups)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(renderRecurringGroup)}
            </div>
          </div>
        )}

        {/* Single Appointments */}
        {allsingleAppointments?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Single Appointments</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allsingleAppointments
                ?.map(appointment => (
                  <div key={appointment.id} className="bg-white rounded-xl shadow-lg p-6">
                    {renderAppointmentCard(appointment)}
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Single Appointments Pagination Controls */}
        {(singlePagination.previous || singlePagination.next) && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePreviousSinglePage}
              disabled={!singlePagination.previous}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextSinglePage}
              disabled={!singlePagination.next}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}


        {totalAppointments === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600">Create your first appointment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
