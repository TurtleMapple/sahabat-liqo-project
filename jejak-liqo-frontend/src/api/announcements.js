import api from './axiosInstance';

export const getAnnouncements = async (params = {}) => {
  const response = await api.get('/announcements', { params });
  return response.data;
};