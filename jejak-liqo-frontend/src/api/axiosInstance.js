import axios from 'axios';
import { getAuthData, clearAuthData } from '../utils/authHelper';

// Create axios instance with base URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // Increased default timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Bearer token if available and not expired
api.interceptors.request.use(
  (config) => {
    const authData = getAuthData();
    if (authData?.token) {
      // Check if token is expired before making request
      if (authData.expiresAt && Date.now() > authData.expiresAt) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
    
    // Remove Content-Type for FormData to let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Unauthorized — token expired or invalid
      console.warn('Token expired or invalid, clearing auth data');
      clearAuthData();
      
      // Trigger token expiration modal via custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
      
      // Smooth redirect to login after delay
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (response?.status === 419) {
      // CSRF token mismatch (Laravel)
      console.warn('CSRF token mismatch. Refreshing page...');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export default api;