import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Check, X, Edit3 } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectAllUsers,
  selectUsersLoading,
  loadUsers,
  updateUserCalendar
} from '../store/slices/userSlice';
import { addNotification } from '../store/slices/uiSlice';

export const UsersList = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const loading = useAppSelector(selectUsersLoading);
  
  const [editingCalendarId, setEditingCalendarId] = useState(null);
  const [calendarIdInput, setCalendarIdInput] = useState('');

  // Load users on component mount
  useEffect(() => {
    dispatch(loadUsers());
  }, [dispatch]);

  const handleEditCalendar = (userId, currentCalendarId) => {
    setEditingCalendarId(userId);
    setCalendarIdInput(currentCalendarId || '');
  };

  const handleSaveCalendar = async (userId) => {
    try {
      await dispatch(updateUserCalendar({ 
        userId, 
        calendarId: calendarIdInput.trim() || null 
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: calendarIdInput.trim() 
          ? 'Calendar ID updated successfully' 
          : 'Calendar ID removed successfully'
      }));
      
      setEditingCalendarId(null);
      setCalendarIdInput('');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update calendar ID'
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditingCalendarId(null);
    setCalendarIdInput('');
  };

  const renderCalendarStatus = (user) => {
    if (editingCalendarId === user.id) {
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
            onClick={() => handleSaveCalendar(user.id)}
            disabled={loading}
            className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
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
        {user.calendarId ? (
          <span className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg">
            {user.calendarId}
          </span>
        ) : (
          <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-lg font-medium">
            No Calendar
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-purple-100 rounded-lg">
          <User className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Users List</h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {users.length} total users
        </span>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
      </div>

      {users.length === 0 && !loading ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users yet</h3>
          <p className="text-gray-600">Users will appear here once they are loaded from Go High Level</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                      ID: {user.ghlId}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {renderCalendarStatus(user)}
                    {editingCalendarId !== user.id && (
                      <button
                        onClick={() => handleEditCalendar(user.id, user.calendarId)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};