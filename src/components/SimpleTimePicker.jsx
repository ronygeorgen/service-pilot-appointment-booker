import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export const SimpleTimePicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
    }
  }, [value]);

  const formatDisplayTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleTimeSelect = (hour, minute, period) => {
    let hour24 = hour;
    if (period === 'AM' && hour === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
  };

  const handleConfirm = () => {
    handleTimeSelect(selectedHour, selectedMinute, selectedPeriod);
    setIsOpen(false);
  };

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45]; // Common minute intervals
  const periods = ['AM', 'PM'];

  // Quick time presets
  const quickTimes = [
    { label: '9:00 AM', hour: 9, minute: 0, period: 'AM' },
    { label: '12:00 PM', hour: 12, minute: 0, period: 'PM' },
    { label: '1:00 PM', hour: 1, minute: 0, period: 'PM' },
    { label: '3:00 PM', hour: 3, minute: 0, period: 'PM' },
    { label: '5:00 PM', hour: 5, minute: 0, period: 'PM' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-pointer bg-white hover:border-gray-400"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {value ? formatDisplayTime(value) : placeholder}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 w-80">
          <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">Select Time</h3>
          
          {/* Quick Time Presets */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-1.5">
              {quickTimes.map((time) => (
                <button
                  key={time.label}
                  type="button"
                  onClick={() => handleTimeSelect(time.hour, time.minute, time.period)}
                  className={`px-2 py-1.5 text-xs rounded-md border transition-all ${
                    selectedHour === time.hour && selectedMinute === time.minute && selectedPeriod === time.period
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Time Selectors */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {/* Hour Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-gray-600 mb-1">Hour</label>
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium text-sm w-16"
                >
                  {hours.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>

              <div className="text-lg font-bold text-gray-400 mt-4">:</div>

              {/* Minute Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-gray-600 mb-1">Min</label>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium text-sm w-16"
                >
                  {minutes.map(minute => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selector */}
              <div className="flex flex-col items-center">
                <label className="text-xs font-medium text-gray-600 mb-1">Period</label>
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  {periods.map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        selectedPeriod === period
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-gray-900">
                {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Alternative: Native HTML Time Input with Custom Styling
export const NativeTimePicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [isFocused, setIsFocused] = useState(false);

  const formatDisplayTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="relative">
      <div className={`w-full px-4 py-3 border rounded-lg transition-all bg-white ${
        isFocused 
          ? 'ring-2 ring-blue-500 border-transparent' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
            style={{ colorScheme: 'light' }}
          />
          {!value && (
            <span className="absolute left-12 text-gray-500 pointer-events-none">
              {placeholder}
            </span>
          )}
        </div>
      </div>
      
      {/* Display formatted time below */}
      {value && (
        <div className="mt-1 text-sm text-gray-600 px-4">
          {formatDisplayTime(value)}
        </div>
      )}
    </div>
  );
};