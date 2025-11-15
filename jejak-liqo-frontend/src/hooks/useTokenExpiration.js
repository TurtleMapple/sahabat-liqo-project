import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAuthData, clearAuthData, isTokenExpiringSoon, getTokenRemainingTime } from '../utils/authHelper';

export const useTokenExpiration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const handleTokenExpiration = useCallback(() => {
    clearAuthData();
    
    // Only show modal and redirect if not already on login page
    if (!location.pathname.includes('/login')) {
      setShowExpirationModal(true);
    }
  }, [location.pathname]);

  const showExpirationWarning = useCallback(() => {
    if (!hasShownWarning) {
      const remaining = getTokenRemainingTime();
      setRemainingTime(remaining);
      setShowWarningModal(true);
      setHasShownWarning(true);
    }
  }, [hasShownWarning]);

  const handleLoginRedirect = useCallback(() => {
    setShowExpirationModal(false);
    setShowWarningModal(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleCloseWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const authData = getAuthData();
      
      if (!authData) {
        return; // Not logged in
      }

      if (!authData.expiresAt) {
        return; // No expiration data
      }

      const now = Date.now();
      const timeUntilExpiry = authData.expiresAt - now;

      // If token is expired
      if (timeUntilExpiry <= 0) {
        handleTokenExpiration();
        return;
      }

      // If token expires in 5 minutes, show warning
      if (isTokenExpiringSoon()) {
        showExpirationWarning();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    // Listen for token expiration from axios interceptor
    const handleTokenExpiredEvent = () => {
      handleTokenExpiration();
    };

    window.addEventListener('tokenExpired', handleTokenExpiredEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tokenExpired', handleTokenExpiredEvent);
    };
  }, [handleTokenExpiration, showExpirationWarning]);

  return {
    handleTokenExpiration,
    showExpirationWarning,
    showExpirationModal,
    showWarningModal,
    remainingTime,
    handleLoginRedirect,
    handleCloseWarning
  };
};