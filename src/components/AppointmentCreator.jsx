import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Repeat } from 'lucide-react';
import { DatePicker } from './DateTimePicker';
import { SimpleTimePicker } from './SimpleTimePicker';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { clearContacts, clearPeopleSuggestions, createAppointment, searchContacts, searchPeople, selectAppointmentsLoading } from '../store/slices/appointmentSlice';
import { setActiveTab, addNotification } from '../store/slices/uiSlice';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { DateTime } from 'luxon';

export const AppointmentCreator = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppointmentsLoading);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedPeople, setAssignedPeople] = useState([]);
  const [assignedPeopleUserIDs, setAssignedPeopleUserIDs] = useState([]);
  const [newPerson, setNewPerson] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState({
    frequency: 'weekly',
    // interval: 1,
    repeatCount: 10,
  });

  const [isContact, setIsContact] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactSearch, setContactSearch] = useState('');
  const {peopleSuggestions, contacts, contactsSearchLoading, peopleSuggestionsLoading, success} = useAppSelector(state => state.appointments);

const [personSearch, setPersonSearch] = useState('');

  useEffect(()=>{
    setTitle('')
    setContactSearch('')
  },[success])

  // Debounce API call
  useEffect(() => {
    if (!contactId && contactSearch.length > 1) {
      debouncedSearch(contactSearch);
    }
  }, [contactSearch]);

  const debouncedSearch = debounce((query) => {
    dispatch(searchContacts(query));
  }, 300); // 300ms debounce

  useEffect(() => {
    if (personSearch.length > 1) {
      debouncedPeopleSearch(personSearch);
    }
  }, [personSearch]);

  const debouncedPeopleSearch = debounce((query) => {
    dispatch(searchPeople(query));
  }, 300);



  const [params] = useSearchParams();
  const contactId = params.get('contactId')

  const handleAddPerson = () => {
    if (newPerson.trim() && !assignedPeople.includes(newPerson.trim())) {
      setAssignedPeople([...assignedPeople, newPerson.trim()]);
      setNewPerson('');
    }
  };

  const handleRemovePerson = (person) => {
    setAssignedPeople(assignedPeople.filter(p => p !== person));
    setAssignedPeopleUserIDs(assignedPeopleUserIDs.filter(user_id => user_id !== person.user_id));
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

    if (!title || !date || !time || assignedPeople.length === 0 || (!selectedContactId && !contactId)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields including contact'
      }));
      return;
    }

    const start = DateTime.fromFormat(
      `${date} ${time}`,
      'yyyy-MM-dd HH:mm',
      { zone: 'America/Chicago' }
    );

    const startDateTime = start.toUTC().toISO();
    const endDateTime = start.plus({ minutes: 30 }).toUTC().toISO();

    const appointmentData = {
      title,
      startDateTime,
      endDateTime,
      locationId:'b8qvo7VooP3JD3dIZU42',
      contactId: selectedContactId || contactId,
      userIds: [...assignedPeopleUserIDs],
      type: isRecurring ? 'recurring' : 'single',
        ...(isRecurring && {
          interval: recurringPattern.frequency,  // renamed
          count: recurringPattern.repeatCount,   // renamed
        }),
    };

    dispatch(createAppointment(appointmentData));

    console.log(appointmentData, 'appointmentData');
    

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
        // interval: 1,
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

  console.log(assignedPeopleUserIDs);
  

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

          {!contactId && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) =>{ setContactSearch(e.target.value); setIsContact(true);}}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Search contact..."
                  required
                />

                {/* Spinner on the right inside input */}
                {contactsSearchLoading && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Suggestions List */}
              {isContact && contactSearch && (
                <ul className="absolute z-30 bg-white w-full border border-gray-200 rounded mt-1 shadow">
                  {contacts?.length > 0 ? (
                    contacts.map((contact) => (
                      <li
                        key={contact.id}
                        onClick={() => {
                          setContactSearch(`${contact.first_name} ${contact.last_name || ''}`);
                          setSelectedContactId(contact.contact_id);
                          setIsContact(false);
                          dispatch(clearContacts());
                        }}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {contact?.first_name} {contact?.last_name}
                      </li>
                    ))
                  ) : (!contactsSearchLoading &&
                    <li className="px-4 py-2 text-gray-500">No contacts found</li>
                  )}
                </ul>
              )}
            </div>
          )}

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
            <div className="flex gap-2 mb-3 relative">
              <div className="relative w-full">
                <input
                  type="text"
                  value={personSearch}
                  onChange={(e) => {
                    setPersonSearch(e.target.value);
                    setNewPerson(e.target.value);
                  }}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Search and add person"
                />

                {/* Spinner for person search */}
                {peopleSuggestionsLoading && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {/* <button
                type="button"
                onClick={() => {
                  handleAddPerson();
                  setPersonSearch('');
                }}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button> */}

              {/* Suggestions */}
              {personSearch && (
                <ul className="absolute top-full left-0 z-10 bg-white w-full border border-gray-200 rounded mt-1 shadow">
                  {peopleSuggestions.length > 0 ? (
                    peopleSuggestions.map((person) => (
                      <li
                        key={person.id}
                        onClick={() => {
                          if (!assignedPeopleUserIDs.includes(person?.user_id)) {
                            setAssignedPeople([...assignedPeople, person]);
                            setAssignedPeopleUserIDs([...assignedPeopleUserIDs, person.user_id]);
                          }
                          setPersonSearch('');
                          dispatch(clearPeopleSuggestions());
                        }}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {person?.name}
                      </li>
                    ))
                  ) : (!peopleSuggestionsLoading &&
                    <li className="px-4 py-2 text-gray-500">No people found</li>
                  )}
                </ul>
              )}
            </div>
            {assignedPeople.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignedPeople.map((person) => (
                  <span
                    key={person?.user_id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    {person?.name}
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
                  {/* <div>
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
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Count
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