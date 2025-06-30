import { axiosInstance } from "./api"

export const searchContactsService = async (query) => {
  return await axiosInstance.get(`/accounts/search/contacts/?search=${query}`);
};

export const searchPeopleService = async (query) => {
  return await axiosInstance.get(`/accounts/search/users/?search=${query}`);
};

export const createAppointmentService = async (data) => {
  return await axiosInstance.post('accounts/appointments/book/', data);
};

export const getRecurringGroups = async () => {
  const response = await axiosInstance.get('/accounts/recurring-groups/');
  return response.data;
};

export const getRecurringGroupAppointments = async (groupId) => {
  const response = await axiosInstance.get(`/accounts/recurring-groups/${groupId}/appointments/`);
  
  return {
    count: response.data.count, // Preserve the count from API
    results: response.data.results
  };
};

export const deleteRecurringGroup = async (groupId) => {
  const response = await axiosInstance.delete(`/accounts/recurring-groups/${groupId}/delete/`);
  return response.data;
};

// Add these new service functions
export const deleteSingleAppointment = async (appointmentId) => {
  const response = await axiosInstance.delete(`/accounts/appointments/${appointmentId}/delete/`);
  return response.data;
};

export const getAllRecurringAppointments = async () => {
  // First get all recurring groups
  const groupsResponse = await getRecurringGroups();
  const groups = groupsResponse.results;
  
  // Then get appointments for each group
  const appointmentsPromises = groups.map(group => 
    getRecurringGroupAppointments(group.group_id)
  );
  
  const appointmentsResponses = await Promise.all(appointmentsPromises);
  
  return groups.map((group, index) => ({
    group,
    appointments: appointmentsResponses[index].results
  }));
};