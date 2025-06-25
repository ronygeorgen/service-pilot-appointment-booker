import React, { useState } from 'react';
import { Calendar, Clock, Users, Repeat } from 'lucide-react';
import { DatePicker } from './DateTimePicker';
import { SimpleTimePicker } from './SimpleTimePicker';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { createAppointment, selectAppointmentsLoading } from '../store/slices/appointmentSlice';
import { setActiveTab, addNotification } from '../store/slices/uiSlice';

export const AppointmentCreator = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentsLoading);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedPeople, setAssignedPeople] = useState([]);
  const [newPerson, setNewPerson] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState({
    frequency: 'weekly',
    interval: 1,
    repeatCount: 10,
  });

  const handleAddPerson = () => {
    if (newPerson.trim() && !assignedPeople.includes(newPerson.trim())) {
      setAssignedPeople([...assignedPeople, newPerson.trim()]);
      setNewPerson('');
    }
  };

  const handleRemovePerson = (person) => {
    setAssignedPeople(assignedPeople.filter(p => p !== person));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !date || !time || assignedPeople.length === 0) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      }));
      return;
    }

    const appointmentData = {
      title,
      date,
      time,
      assignedPeople: [...assignedPeople],
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
    };

    try {
      await dispatch(createAppointment(appointmentData)).unwrap();
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Success!',
        message: isRecurring 
          ? `Created ${recurringPattern.repeatCount} recurring appointments`
          : 'Appointment created successfully'
      }));

      // Reset form
      setTitle('');
      setDate('');
      setTime('');
      setAssignedPeople([]);
      setIsRecurring(false);
      setRecurringPattern({
        frequency: 'weekly',
        interval: 1,
        repeatCount: 10,
      });

      // Switch to manage tab
      dispatch(setActiveTab('manage'));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to create appointment'
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Appointment Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter appointment title"
              required
              disabled={loading}
            />
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Select appointment date"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time *
              </label>
              <SimpleTimePicker
                value={time}
                onChange={setTime}
                placeholder="Select appointment time"
                disabled={loading}
              />
            </div>
          </div>

          {/* Assigned People */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned People *
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Add person name"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddPerson}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {assignedPeople.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignedPeople.map((person) => (
                  <span
                    key={person}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    {person}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Options */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={loading}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="recurring" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Repeat className="w-4 h-4" />
                Make this a recurring appointment
              </label>
            </div>

            {isRecurring && (
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={recurringPattern.frequency}
                      onChange={(e) => setRecurringPattern({
                        ...recurringPattern,
                        frequency: e.target.value
                      })}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Every
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={recurringPattern.interval}
                      onChange={(e) => setRecurringPattern({
                        ...recurringPattern,
                        interval: parseInt(e.target.value)
                      })}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={recurringPattern.repeatCount}
                      onChange={(e) => setRecurringPattern({
                        ...recurringPattern,
                        repeatCount: parseInt(e.target.value)
                      })}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              isRecurring ? `Create ${recurringPattern.repeatCount} Recurring Appointments` : 'Create Appointment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};