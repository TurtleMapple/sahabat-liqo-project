// src/routes/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { role, isAuthenticated, loading } = useAuth();

  // Always call hooks in the same order
  useEffect(() => {
    const showToast = localStorage.getItem("showLoginSuccessToast");
    if (showToast === "true") {
      localStorage.removeItem("showLoginSuccessToast");
      toast.success("Selamat datang! Login berhasil.");
    }
  }, []);

  // Loading state with smooth transition
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4DABFF]/10 via-white to-[#4DABFF]/5 dark:from-[#1a2332] dark:via-[#0d1117] dark:to-[#1a2332] transition-all duration-300">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DABFF] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Memvalidasi autentikasi...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirectMap = {
      super_admin: "/superadmin/dashboard",
      admin: "/admin/dashboard",
      mentor: "/mentor/dashboard",
    };
    return <Navigate to={redirectMap[role] || "/login"} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;