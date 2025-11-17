import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthData } from '../utils/authHelper';
import toast from 'react-hot-toast';

const RoleGuard = ({ children }) => {
  const location = useLocation();
  const authData = getAuthData();

  useEffect(() => {
    if (!authData?.user?.role) return;

    const currentPath = location.pathname;
    const userRole = authData.user.role;

    // Define role-based path restrictions
    const roleRestrictions = {
      super_admin: ['/admin', '/mentor'],
      admin: ['/superadmin', '/mentor'],
      mentor: ['/superadmin', '/admin']
    };

    // Check if current path is restricted for user's role
    const restrictedPaths = roleRestrictions[userRole] || [];
    const isRestricted = restrictedPaths.some(path => currentPath.startsWith(path));

    if (isRestricted) {
      toast.error('Akses ditolak! Anda tidak memiliki izin untuk mengakses halaman ini.');
    }
  }, [location.pathname, authData]);

  // If no auth data, let ProtectedRoute handle it
  if (!authData?.user?.role) {
    return children;
  }

  const currentPath = location.pathname;
  const userRole = authData.user.role;

  // Define allowed paths for each role
  const allowedPaths = {
    super_admin: ['/superadmin', '/login', '/forgot-password', '/reset-password'],
    admin: ['/admin', '/login', '/forgot-password', '/reset-password'],
    mentor: ['/mentor', '/login', '/forgot-password', '/reset-password']
  };

  const userAllowedPaths = allowedPaths[userRole] || [];
  const isAllowed = userAllowedPaths.some(path => currentPath.startsWith(path)) || currentPath === '/';

  if (!isAllowed) {
    // Redirect to appropriate dashboard
    const dashboardMap = {
      super_admin: '/superadmin/dashboard',
      admin: '/admin/dashboard',
      mentor: '/mentor/dashboard'
    };

    return <Navigate to={dashboardMap[userRole] || '/login'} replace />;
  }

  return children;
};

export default RoleGuard;