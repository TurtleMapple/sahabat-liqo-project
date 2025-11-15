import api from './axiosInstance';

export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const formData = new FormData();
    
    console.log('Profile data to send:', profileData);
    
    // Append all profile fields
    Object.keys(profileData).forEach(key => {
      if (key === 'profile_picture') {
        // Only append profile_picture if it's a File object
        if (profileData[key] instanceof File) {
          console.log('Appending profile picture file:', profileData[key].name);
          formData.append('profile_picture', profileData[key]);
        }
        // Skip if it's not a File (empty string, null, etc.)
      } else if (profileData[key] !== null && profileData[key] !== undefined && profileData[key] !== '') {
        console.log(`Appending ${key}:`, profileData[key]);
        formData.append(key, profileData[key]);
      }
    });
    
    const response = await api.post('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // Increase timeout for file uploads
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};