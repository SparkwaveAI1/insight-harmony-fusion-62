
import React from "react";
import { Navigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import Section from "@/components/ui-custom/Section";

const Auth = () => {
  const { user, isLoading } = useAuth();

  // If user is already authenticated, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Section className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to PersonaAI</h1>
            <p className="text-muted-foreground">Sign in to your account or create a new one</p>
          </div>
          <AuthForm />
        </div>
      </Section>
    </div>
  );
};

export default Auth;
