import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const publicRoutes = [
  '/',
  '/listings',
  '/properties/developer/:developerName',
  '/developer',
  '/about',
  '/contact',
  '/signup',
  '/login',
];

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, authLoading } = useContext(AuthContext);
  const location = useLocation();
  console.log(`PrivateRoute: Checking route ${location.pathname}, user: ${!!user}, role: ${user?.role || 'none'}, authLoading: ${authLoading}`);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      </div>
    );
  }

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes(':')) {
      const baseRoute = route.split('/:')[0];
      return location.pathname.startsWith(baseRoute);
    }
    return route === location.pathname;
  });

  if (isPublicRoute) {
    return children;
  }

  if (!user) {
    console.log(`PrivateRoute: No user, redirecting to /login from: ${location.pathname}`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && requiredRole !== 'any' && user.role !== requiredRole) {
    console.log(`PrivateRoute: Role ${user.role} does not match required role ${requiredRole}, redirecting to /`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;