
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-300">Loading your profile...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    console.log('User not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
