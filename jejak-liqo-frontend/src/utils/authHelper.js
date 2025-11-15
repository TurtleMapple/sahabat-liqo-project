export const setAuthData = (token, user, expiresAt = null) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store token expiration time
  if (expiresAt) {
    localStorage.setItem('token_expires_at', expiresAt.toString());
  } else {
    // Default: 3 hours from now if not provided
    const defaultExpiry = Date.now() + (3 * 60 * 60 * 1000);
    localStorage.setItem('token_expires_at', defaultExpiry.toString());
  }
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const expiresAt = localStorage.getItem('token_expires_at');

  if (token && user) {
    // Check if token is expired
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      console.warn('Token expired, clearing auth data');
      clearAuthData();
      return null;
    }

    try {
      const parsedUser = JSON.parse(user);
      return {
        token,
        user: parsedUser,
        role: parsedUser.role,
        expiresAt: parseInt(expiresAt)
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
      return null;
    }
  }
  return null;
};

export const clearAuthData = () => {
  // Preserve theme settings
  const theme = localStorage.getItem('theme');
  const darkMode = localStorage.getItem('darkMode');
  
  // Clear auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('token_expires_at');
  
  // Keep theme settings
  if (theme) localStorage.setItem('theme', theme);
  if (darkMode) localStorage.setItem('darkMode', darkMode);
};

export const isAuthenticated = () => {
  return !!getAuthData();
};

// Check if token will expire soon (within 5 minutes)
export const isTokenExpiringSoon = () => {
  const authData = getAuthData();
  if (!authData || !authData.expiresAt) return false;
  
  const fiveMinutes = 5 * 60 * 1000;
  return (authData.expiresAt - Date.now()) < fiveMinutes;
};

// Get remaining time in minutes
export const getTokenRemainingTime = () => {
  const authData = getAuthData();
  if (!authData || !authData.expiresAt) return 0;
  
  const remaining = authData.expiresAt - Date.now();
  return Math.max(0, Math.floor(remaining / (60 * 1000)));
};
