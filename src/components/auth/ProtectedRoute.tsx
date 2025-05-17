
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("ProtectedRoute - auth state:", { user, isLoading });
    
    if (!isLoading) {
      if (!user) {
        console.log("ProtectedRoute - No authenticated user, redirecting to sign-in");
        navigate("/sign-in");
      } else {
        console.log("ProtectedRoute - User authenticated, allowing access");
      }
      setAuthChecked(true);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    console.log("ProtectedRoute - Still checking authentication...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return authChecked && user ? <>{children}</> : null;
};
