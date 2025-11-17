// src/hooks/useAuth.js
import { useState, useEffect, useRef } from "react";
import { getAuthData, clearAuthData } from "../utils/authHelper"; 

const useAuth = () => {
  const [authState, setAuthState] = useState({
    role: null,
    isAuthenticated: false,
    loading: true,
    user: null
  });
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Add small delay to prevent flashing
    setTimeout(() => {
      try {
        const authData = getAuthData();
        
        // Validate role
        const validRoles = ['super_admin', 'admin', 'mentor'];
        const isValidRole = authData?.user?.role && validRoles.includes(authData.user.role);
        
        if (authData?.token && isValidRole) {
          setAuthState({
            role: authData.user.role,
            isAuthenticated: true,
            loading: false,
            user: authData.user
          });
        } else {
          // Clear invalid auth data
          if (authData?.token && !isValidRole) {
            console.warn('Invalid role detected, clearing auth data');
            clearAuthData();
          }
          
          setAuthState({
            role: null,
            isAuthenticated: false,
            loading: false,
            user: null
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setAuthState({
          role: null,
          isAuthenticated: false,
          loading: false,
          user: null
        });
      }
    }, 50);
  }, []);

  return authState;
};

export default useAuth;