import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Check, X, Edit3 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectAllUsers,
  selectUsersLoading,
  loadUsers,
  updateUserCalendar
} from '../store/slices/userSlice';
import { addNotification } from '../store/slices/uiSlice';

export const UsersList = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  
  const [editingCalendarId, setEditingCalendarId] = useState(null);
  const [calendarIdInput, setCalendarIdInput] = useState('');

  useEffect(() => {
    dispatch(loadUsers());
  }, [dispatch]);

  useEffect(() => {
  console.log('Current editing state:', editingCalendarId);
}, [editingCalendarId]);

  const handleEditCalendar = (user_id, currentCalendarId) => {
    setEditingCalendarId(user_id);
    setCalendarIdInput(currentCalendarId || '');
  };

const handleSaveCalendar = async (user_id) => {
    console.log('Saving calendar for user:', user_id, 'with ID:', calendarIdInput);
  try {
    const result = await dispatch(updateUserCalendar({ 
      userId: user_id, 
      calendarId: calendarIdInput.trim() 
    })).unwrap();
    console.log('Update successful:', result);
    dispatch(addNotification({
      type: 'success',
      message: 'Calendar ID updated successfully'
    }));
    
    // Force clear editing state regardless of response
    setEditingCalendarId(null);
    setCalendarIdInput('');
    
  } catch (error) {
    console.error('Update failed:', error);
    dispatch(addNotification({
      type: 'error',
      message: error || 'Failed to update calendar ID'
    }));
  }
};

  const renderCalendarStatus = (user) => {
    if (editingCalendarId === user.user_id) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <input
              type="text"
              value={calendarIdInput}
              onChange={(e) => setCalendarIdInput(e.target.value)}
              placeholder="Enter Calendar ID"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={loading}
            />
          </div>
          <button
            onClick={() => handleSaveCalendar(user.user_id)}
            disabled={loading}
            className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingCalendarId(null)}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        {user.calendar_id ? (
          <span className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg">
            {user.calendar_id}
          </span>
        ) : (
          <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-lg font-medium">
            No Calendar
          </span>
        )}
        <button
          onClick={() => handleEditCalendar(user.user_id, user.calendar_id)}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 rounded-lg">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Users List</h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {users.length} users
        </span>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.user_id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user.user_id}</p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2">
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {renderCalendarStatus(user)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};