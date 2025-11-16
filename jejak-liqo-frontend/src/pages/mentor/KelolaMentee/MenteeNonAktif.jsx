import React from 'react';
import { Navigate } from 'react-router-dom';

const MenteeNonAktif = () => {
  return <Navigate to="/mentor/dashboard" replace />;
};

export default MenteeNonAktif;