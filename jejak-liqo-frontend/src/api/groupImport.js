import axiosInstance from './axiosInstance';

export const downloadGroupTemplate = async () => {
  const response = await axiosInstance.get('/import/group-template', {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'template_kelompok.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importGroups = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post('/import/groups', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};