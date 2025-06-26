import { axiosInstance } from "./api";

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      console.log('Adding token to request:', accessToken); // Debug log
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('No access token found in localStorage');
    }
    
    console.log('Request config:', config); // Debug log
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);