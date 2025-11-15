// src/hooks/useAuth.js
import { useState, useEffect, useRef } from "react";
import { getAuthData } from "../utils/authHelper"; 

const useAuth = () => {
  const [authState, setAuthState] = useState({
    role: null,
    isAuthenticated: false,
    loading: true
  });
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Add small delay to prevent flashing
    setTimeout(() => {
      try {
        const authData = getAuthData();
        
        setAuthState({
          role: authData?.user?.role || null,
          isAuthenticated: !!(authData?.token && authData?.user?.role),
          loading: false
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          role: null,
          isAuthenticated: false,
          loading: false
        });
      }
    }, 50);
  }, []);

  return authState;
};

export default useAuth;