import api from './axiosInstance';

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.post('/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/change-password', passwordData);
  return response.data;
};