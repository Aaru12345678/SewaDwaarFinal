import React from 'react';
import { Navigate } from 'react-router-dom';

const HelpdeskProtectedRoute = ({ children }) => {
  const helpdeskId = localStorage.getItem('username');
  const roleCode = localStorage.getItem('role_code');
  
  if (!helpdeskId || !roleCode) {
    return <Navigate to="/login/helpdesklogin" replace />;
  }
  
  return children;
};

export default HelpdeskProtectedRoute;

