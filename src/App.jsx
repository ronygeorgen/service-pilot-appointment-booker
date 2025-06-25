import React, { useEffect } from 'react';
import { Calendar, Settings, Plus } from 'lucide-react';
import { AppointmentCreator } from './components/AppointmentCreator';
import { AppointmentManager } from './components/AppointmentManager';
import { SettingsMenu } from './components/SettingsMenu';
import NotificationToast from './components/NotificationToast';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { 
  selectActiveTab, 
  selectShowSettings, 
  setActiveTab, 
  setShowSettings 
} from './store/slices/uiSlice';
import { 
  selectAllAppointments, 
  selectAppointmentsLoading,
  loadAppointments 
} from './store/slices/appointmentSlice';

function App() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const showSettings = useAppSelector(selectShowSettings);
  const appointments = useAppSelector(selectAllAppointments);
  const loading = useAppSelector(selectAppointmentsLoading);

  // Load appointments on app start
  useEffect(() => {
    dispatch(loadAppointments());
  }, [dispatch]);

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const handleToggleSettings = () => {
    dispatch(setShowSettings(!showSettings));
  };

  const handleCloseSettings = () => {
    dispatch(setShowSettings(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Go High Level</h1>
                <p className="text-sm text-gray-600">Recurring Appointment Booker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
              <span className="text-sm text-gray-600">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </span>
              <div className="relative">
                <button
                  onClick={handleToggleSettings}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
                {showSettings && (
                  <SettingsMenu onClose={handleCloseSettings} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => handleTabChange('create')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create Appointment
            </button>
            <button
              onClick={() => handleTabChange('manage')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage Appointments
              {appointments.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-medium">
                  {appointments.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <AppointmentCreator />
        ) : (
          <AppointmentManager />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2025 Go High Level Appointment Booker. Built for professional use.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Recurring appointments made easy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <NotificationToast />
    </div>
  );
}

export default App;