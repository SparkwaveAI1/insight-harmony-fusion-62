
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAuth(redirectTo = "/auth") {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { user, isLoading };
}
