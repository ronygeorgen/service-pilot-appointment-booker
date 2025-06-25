import React, { useRef, useEffect } from 'react';
import { Settings, BookOpen, X } from 'lucide-react';

export const SettingsMenu = ({ onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleOnboarding = () => {
    alert('Onboarding feature coming soon! This will guide you through setting up your Go High Level integration.');
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="py-2">
        <button
          onClick={handleOnboarding}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Onboarding</div>
            <div className="text-sm text-gray-600">Get started with Go High Level</div>
          </div>
        </button>
      </div>
    </div>
  );
};