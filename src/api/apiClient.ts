import environment from '@/config/Environment';
import axios from 'axios';

// Base URL for Container API (Modify as needed)
const API_BASE_URL = `${environment.VITE_API_HOST}/api`;

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if Available
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors Globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      if (error.response.status === 401) {
        console.error('Unauthorized! Redirecting to login.');
        window.location.href = '/login'; // Redirect to login
      } else if (error.response.status === 500) {
        console.error('Server error!');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
