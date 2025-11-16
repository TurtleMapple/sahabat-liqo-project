import api from './axiosInstance';
import { setAuthData, clearAuthData } from '../utils/authHelper';

export const login = async (email, password, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    const response = await api.post('/login', { email, password }, {
      timeout: retryCount === 0 ? 15000 : 10000 // First attempt gets longer timeout
    });

    const token = response.data?.data?.token;
    const user = response.data?.data?.user;
    const tokenExpiresAt = response.data?.data?.token_expires_at;

    if (!token || !user) {
      console.error('Invalid login response:', response.data);
      throw new Error('Format respons login tidak valid dari server.');
    }

    // Convert timestamp to milliseconds if provided
    const expiresAt = tokenExpiresAt ? tokenExpiresAt * 1000 : null;
    setAuthData(token, user, expiresAt);

    return { success: true, user };
  } catch (error) {
    // Retry on timeout or network errors
    if ((error.code === 'ECONNABORTED' || error.message?.includes('timeout')) && retryCount < maxRetries) {
      console.warn(`Login timeout, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return login(email, password, retryCount + 1);
    }
    
    // Enhanced error handling
    const errorData = error.response?.data;
    const status = error.response?.status;
    
    console.error('Login gagal:', errorData || error);
    
    // Handle specific error types
    if (status === 500) {
      const errorMessage = errorData?.message || 'Server error';
      if (errorMessage.includes('Cannot redeclare')) {
        throw new Error('Server sedang dalam perbaikan. Silakan coba lagi nanti.');
      }
      throw new Error('Terjadi kesalahan server. Silakan coba lagi.');
    }
    
    if (status === 422) {
      throw new Error('Email atau password tidak valid.');
    }
    
    if (status === 401) {
      throw new Error('Email atau password salah.');
    }
    
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    console.log('Logout successful:', response.data.message);
  } catch (error) {
    console.warn('Logout error (ignored):', error);
  } finally {
    clearAuthData();
  }
};

export const logoutAll = async () => {
  try {
    const response = await api.post('/logout-all');
    console.log('Logout all successful:', response.data.message);
  } catch (error) {
    console.warn('Logout all error (ignored):', error);
  } finally {
    clearAuthData();
  }
};

export const validateToken = async () => {
  try {
    // Panggil endpoint protected untuk validasi token
    const response = await api.get('/dashboard/stats-comparison');

    // Jika berhasil, return user data dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return { success: true, user: parsedUser };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
    throw new Error('User data tidak ditemukan');
  } catch (error) {
    console.error('Token validation failed:', error);

    // Jika 401 atau 419, token invalid - clear auth data
    if (error.response?.status === 401 || error.response?.status === 419) {
      clearAuthData();
    }

    throw error;
  }
};


