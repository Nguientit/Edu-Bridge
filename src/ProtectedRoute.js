import React, { useState } from 'react';
import {Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, roles }) => {
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));

    const hasRequiredRole = user && user.role && user.role.some(role => roles.includes(role.name));

    return (
        hasRequiredRole ? (
            <Component />
        ) : (
            <Navigate to="/unauthorizated" />
        )
    );
};

export default ProtectedRoute;
