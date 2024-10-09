import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

function AdminRoute({ children }) {
    const { isAdminLoggedIn } = useAuth();

    return isAdminLoggedIn ? children : <Navigate to="/administrator-login" replace />;
}

export default AdminRoute;