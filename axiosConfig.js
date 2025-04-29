// src/utils/axiosConfig.js
import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for admin token in localStorage
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) or 403 (Forbidden) responses
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Check if we were trying to access an admin route
      if (error.config.url.includes('/admin')) {
        console.log('Admin authentication failed, redirecting to login...');
        // Clear admin auth data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuthenticated');
        
        // Redirect to admin login (this requires window access)
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;