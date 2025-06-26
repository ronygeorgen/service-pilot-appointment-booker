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