import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, roles } = useSelector((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.some((role) => roles.includes(role))) {
        return <Navigate to="/home" />;
    }

    return children;
};

export default ProtectedRoute;
