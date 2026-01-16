import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { isTokenValid, clearAuthData } from '../../lib/authUtils';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Check token validity even if user state exists
  const tokenValid = isTokenValid();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If token is invalid or user is not authenticated, redirect to login
  if (!tokenValid || !isAuthenticated) {
    // Clear any invalid tokens
    if (!tokenValid) {
      clearAuthData();
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

