import api from './axiosInstance';

// Get mentors with filters and pagination
export const getMentors = async (params = {}) => {
  const response = await api.get('/mentors', { params });
  return response.data;
};

// Get mentor statistics
export const getMentorStats = async () => {
  const response = await api.get('/mentors/stats');
  return response.data;
};

// Get single mentor
export const getMentor = async (id) => {
  const response = await api.get(`/mentors/${id}`);
  return response.data;
};

// Create mentor
export const createMentor = async (data) => {
  const response = await api.post('/mentors', data);
  return response.data;
};

// Update mentor
export const updateMentor = async (id, data) => {
  const response = await api.put(`/mentors/${id}`, data);
  return response.data;
};

// Delete mentor (soft delete)
export const deleteMentor = async (id) => {
  const response = await api.delete(`/mentors/${id}`);
  return response.data;
};



// Block mentor
export const blockMentor = async (id) => {
  const response = await api.put(`/mentors/${id}/block`);
  return response.data;
};

// Unblock mentor
export const unblockMentor = async (id) => {
  const response = await api.put(`/mentors/${id}/unblock`);
  return response.data;
};

// Get deleted mentors
export const getDeletedMentors = async (params = {}) => {
  const response = await api.get('/mentors/trashed', { params });
  return response.data;
};

// Restore mentor
export const restoreMentor = async (id) => {
  const response = await api.post(`/mentors/${id}/restore`);
  return response.data;
};

// Get mentor force delete info
export const getMentorForceInfo = async (id) => {
  const response = await api.get(`/mentors/${id}/force-info`);
  return response.data;
};

// Force delete mentor
export const forceDeleteMentor = async (id) => {
  const response = await api.delete(`/mentors/${id}/force`);
  return response.data;
};