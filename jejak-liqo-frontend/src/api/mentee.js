import api from './axiosInstance';

export const menteeAPI = {
  getMentees: (params = {}) => api.get('/mentees', { params }),
  createMentee: (data) => api.post('/mentees', data),
  bulkCreateMentee: (data) => api.post('/mentees/bulk-store', data),
  getMentee: (id) => api.get(`/mentees/${id}`),
  updateMentee: (id, data) => api.put(`/mentees/${id}`, data),
  deleteMentee: (id) => api.delete(`/mentees/${id}`),
  getTrashedMentees: () => api.get('/mentees/trashed'),
  restoreMentee: (id) => api.post(`/mentees/${id}/restore`),
  forceDeleteMentee: (id) => api.delete(`/mentees/${id}/force`),
  bulkUpdate: (data) => api.post('/mentees/bulk-update', data),
  bulkDelete: (data) => api.post('/mentees/bulk-delete', data),
  getStats: () => api.get('/mentees/stats'),
  getGenderStats: () => api.get('/mentees/stats/gender'),
  getMenteeStats: (id) => api.get(`/reports/mentee-stats/${id}`),
  exportData: (params = {}) => api.get('/mentees/export', { params, responseType: 'blob' })
};

// Named exports for backward compatibility
export const getAllMentees = async (params = {}) => {
  const response = await api.get('/mentees', { params });
  return response.data;
};

export const getMentees = async (params = {}) => {
  const response = await api.get('/mentees', { params });
  return response.data;
};

export const createMentee = async (data) => {
  const response = await api.post('/mentees', data);
  return response.data;
};

export const getMentee = async (id) => {
  const response = await api.get(`/mentees/${id}`);
  return response.data;
};

export const updateMentee = async (id, data) => {
  const response = await api.put(`/mentees/${id}`, data);
  return response.data;
};

export const deleteMentee = async (id) => {
  const response = await api.delete(`/mentees/${id}`);
  return response.data;
};