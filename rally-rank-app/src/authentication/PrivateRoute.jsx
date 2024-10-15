import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

function PrivateRoute({ children }) {
    const { isLoggedIn } = useAuth();

    return isLoggedIn ? children : <Navigate to="/auth/user-login" replace />;
}

export default PrivateRoute;