import { axiosInstance, BASE_URL } from "./api";

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axiosInstance.post('/auth/token/refresh/', {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        
        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);





// import axios from "axios";
// import { axiosInstance, BASE_URL } from "./api";


// axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;
      
//       if (error.response && error.response.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true; // Prevent infinite loop
  
//         try {
//           // Send refresh token request
//           const res = await axios.post(`${BASE_URL}/token/refresh/`, {}, { withCredentials: true });
          
//           const newAccessToken = res.data.accessToken;
//           localStorage.setItem('accessToken', newAccessToken);
  
//           // Update Authorization header and retry original request
//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           return axiosInstance(originalRequest);
  
//         } catch (refreshError) {
//           console.error('Refresh token invalid, logging out');
//           // Optional: logout user or redirect to login
//           return Promise.reject(refreshError);
//         }
//       }
  
//       return Promise.reject(error);
//     }
//   );
