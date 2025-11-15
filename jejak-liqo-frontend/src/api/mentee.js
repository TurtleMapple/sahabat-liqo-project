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