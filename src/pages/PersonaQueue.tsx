// MINIMAL TEST VERSION - to isolate whether the problem is here vs elsewhere
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = [
  "cumbucotrader@gmail.com",
  "scott@sparkwave-ai.com",
];

const MinimalQueue = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    console.log("[TEST] MinimalQueue rendering, user:", !!user, "isLoading:", isLoading);
    setStatus("useEffect running");
  }, [user, isLoading]);

  // Wait for auth to load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading auth...</p>
        </div>
      </div>
    );
  }

  // No user = redirect
  if (!user) {
    setStatus("no user, redirecting");
    navigate("/sign-in");
    return null;
  }

  // Check admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  console.log("[TEST] Admin check:", user?.email, isAdmin);

  if (!isAdmin) {
    setStatus("not admin, redirecting to /");
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Persona Queue (Minimal Test)</h1>
      <p>Status: {status}</p>
      <p>User: {user?.email}</p>
      <p>IsAdmin: {isAdmin ? "YES" : "NO"}</p>
    </div>
  );
};

export default MinimalQueue;