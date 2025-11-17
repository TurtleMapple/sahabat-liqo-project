import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/profile';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Checking auth', { hasToken: !!token, hasStoredUser: !!storedUser });
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Try to use stored user first (faster)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Using stored user', parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          localStorage.removeItem('user');
        }
      }
      
      // Fallback to API call
      const response = await getProfile();
      if (response.status === 'success') {
        console.log('AuthContext: Got user from API', response.data);
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (error.response?.status === 401) {
        console.log('AuthContext: Token invalid, clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    updateUser,
    logout,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};