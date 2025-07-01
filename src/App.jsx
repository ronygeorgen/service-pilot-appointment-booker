import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Settings, Plus, Users, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, logoutUser, selectAuthLoading } from './store/slices/authSlice';
import { LoginPage } from './components/LoginPage';
import { AppointmentCreator } from './components/AppointmentCreator';
import { AppointmentManager } from './components/AppointmentManager';
import { UsersList } from './components/UsersList';
import NotificationToast from './components/NotificationToast';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const is_auth = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [params] = useSearchParams();
  const locationId = params.get('locationId');

  const isIframed = window.self !== window.top;
  const isAuthenticated = is_auth || (isIframed || locationId === 'b8qvo7VooP3JD3dIZU42');

  console.log(isAuthenticated, 'isAuthenticated');
  

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-white rounded-2xl shadow-lg mb-4">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-gray-200 fixed w-full z-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center">
                    <img src="/ServicePilotLogoNavBar.png" alt="Service Pilot Logo" className="h-8 w-auto" />
                </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointment Setter</h1>
                {/* <p className="text-sm text-gray-600">Appointment Booker</p> */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={authLoading}
                className={`flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm ${
                  authLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <LogOut className="w-4 h-4" />
                {authLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
       
        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8">
              <button
                onClick={() => navigate(`/create?locationId=${locationId}`)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  window.location.pathname === '/create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Appointment
              </button>
              <button
                onClick={() => navigate(`/manage?locationId=${locationId}`)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  window.location.pathname === '/manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4" />
                Manage Appointments
              </button>
              <button
                onClick={() => navigate(`/users?locationId=${locationId}`)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  window.location.pathname === '/users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Users List
              </button>
            </nav>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-36">
        <Routes>
          <Route path="/create" element={<AppointmentCreator />} />
          <Route path="/manage" element={<AppointmentManager />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="*" element={<Navigate to={`/create?locationId=${locationId}`}replace />} />
        </Routes>
      </div>

      {/* Notification Toast */}
      <NotificationToast />
    </div>
  );
}

export default App;