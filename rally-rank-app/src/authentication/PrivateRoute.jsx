import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

function PrivateRoute({ children }) {
    const { isUserLoggedIn } = useAuth();

    return isUserLoggedIn ? children : <Navigate to="/auth/user-login" replace />;
}

export default PrivateRoute;