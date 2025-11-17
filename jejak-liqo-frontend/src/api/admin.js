import axiosInstance from './axiosInstance';

export const getAllAdmins = async (params = {}) => {
  const response = await axiosInstance.get('/admins', { params });
  return response.data;
};

export const getAdminById = async (id) => {
  const response = await axiosInstance.get(`/admins/${id}`);
  return response.data;
};

export const createAdmin = async (adminData) => {
  const response = await axiosInstance.post('/admins', adminData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await axiosInstance.post(`/admins/${id}`, adminData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await axiosInstance.delete(`/admins/${id}`);
  return response.data;
};

export const toggleAdminStatus = async (id) => {
  const response = await axiosInstance.put(`/admins/${id}/block`);
  return response.data;
};