
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state...");
    
    // First set up the auth state listener before checking existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, {
          userId: currentSession?.user?.id,
          userEmail: currentSession?.user?.email
        });
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          console.log("User authenticated:", {
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log("Found existing session:", {
            userId: existingSession.user?.id,
            userEmail: existingSession.user?.email
          });
          setUser(existingSession.user);
          setSession(existingSession);
        } else {
          console.log("No existing session found");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth session:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("Cleaning up auth listener...");
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      // Email confirmations are disabled, so we can show a success message
      toast.success("Account created successfully! You can now sign in.");
    } catch (error: any) {
      toast.error(error.message || "Error signing up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", {
        userId: data.session?.user?.id,
        userEmail: data.session?.user?.email
      });
      toast.success("Successfully signed in");
    } catch (error: any) {
      console.error("Sign in exception:", error);
      toast.error(error.message || "Error signing in");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      
      // First, clear local state immediately to prevent UI confusion
      setUser(null);
      setSession(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Handle the "Auth session missing" error gracefully
      if (error && error.message !== "Auth session missing!") {
        console.error("Sign out error:", error);
        throw error;
      }
      
      // Even if there was a session missing error, we consider logout successful
      // since the user is already signed out locally
      console.log("Sign out completed successfully");
      toast.success("Successfully signed out");
    } catch (error: any) {
      console.error("Sign out exception:", error);
      // Don't show error for session missing as it means user is already logged out
      if (error.message !== "Auth session missing!") {
        toast.error(error.message || "Error signing out");
      } else {
        toast.success("Successfully signed out");
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset");
      throw error;
    }
  };
  
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/sign-in?reset=true',
      });
      if (error) throw error;
      toast.success("Password reset email sent to your inbox");
    } catch (error: any) {
      toast.error(error.message || "Error sending password reset");
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
