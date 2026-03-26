import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Higher-order component to protect routes based on authentication and roles
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireSubscription = false, disallowAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-darker)' }}>
        <div className="animate-fade-in" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Loading platform...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access restricted for this route
  if (disallowAdmin && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Admin role required
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Subscription required (and not an admin, since admins bypass)
  if (requireSubscription && user.role !== 'admin' && user.subscriptionStatus !== 'active') {
    return <Navigate to="/subscribe" replace />;
  }

  return children;
};

export default ProtectedRoute;
