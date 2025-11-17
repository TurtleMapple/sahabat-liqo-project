import api from './axiosInstance';

export const getActivities = async (params = {}) => {
  const response = await api.get('/activities', { params });
  return response.data;
};