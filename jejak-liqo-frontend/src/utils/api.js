import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Meeting API functions
export const meetingAPI = {
  // Get meetings with filters and pagination
  getMeetings: (params = {}) => {
    return api.get('/meetings', { params });
  },

  // Get meeting statistics
  getStats: () => {
    return api.get('/meetings/stats');
  },

  // Create new meeting
  createMeeting: (data) => {
    return api.post('/meetings', data);
  },

  // Update meeting
  updateMeeting: (id, data) => {
    return api.put(`/meetings/${id}`, data);
  },

  // Delete meeting
  deleteMeeting: (id) => {
    return api.delete(`/meetings/${id}`);
  },

  // Get single meeting
  getMeeting: (id) => {
    return api.get(`/meetings/${id}`);
  },

  // Export PDF
  exportPDF: (params = {}) => {
    return api.get('/meetings/export/pdf', {
      params,
      responseType: 'blob'
    });
  },

  // Export Excel
  exportExcel: (params = {}) => {
    return api.get('/meetings/export/excel', {
      params,
      responseType: 'blob'
    });
  }
};

// Helper function for file download
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default api;