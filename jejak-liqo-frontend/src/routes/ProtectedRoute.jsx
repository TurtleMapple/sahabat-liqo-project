// src/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { role, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [hasShownUnauthorizedToast, setHasShownUnauthorizedToast] = useState(false);

  // Always call hooks in the same order
  useEffect(() => {
    const showToast = localStorage.getItem("showLoginSuccessToast");
    if (showToast === "true") {
      localStorage.removeItem("showLoginSuccessToast");
      toast.success("Selamat datang! Login berhasil.");
    }
  }, []);

  // Show unauthorized access toast
  useEffect(() => {
    if (!loading && isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(role) && !hasShownUnauthorizedToast) {
      setHasShownUnauthorizedToast(true);
      toast.error("Akses ditolak! Anda tidak memiliki izin untuk mengakses halaman ini.");
    }
  }, [loading, isAuthenticated, role, allowedRoles, hasShownUnauthorizedToast]);

  // Skip loading state - let components handle their own loading

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check with proper redirection
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectMap = {
      super_admin: "/superadmin/dashboard",
      admin: "/admin/dashboard",
      mentor: "/mentor/dashboard",
    };
    
    const redirectTo = redirectMap[role];
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    } else {
      // Unknown role - logout and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  return children || <Outlet />;
};

export default ProtectedRoute;