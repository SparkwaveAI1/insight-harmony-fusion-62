
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, Google, Discord } from "lucide-react";
import Card from "@/components/ui-custom/Card";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";
import { Separator } from "@/components/ui/separator";

type AuthMode = "login" | "signup" | "forgotPassword";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, resetPassword, isLoading, signInWithGoogle, signInWithDiscord } = useAuth();
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    validateEmail,
    validatePassword,
    validateForm,
  } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgotPassword") {
      if (!validateEmail()) return;
      
      try {
        await resetPassword(email);
      } catch (error) {
        // Error is handled in the auth context
      }
      return;
    }

    if (!validateForm()) return;

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // Errors are handled in the auth context
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Clear errors when switching modes
    setEmail("");
    setPassword("");
  };

  const handleOAuthSignIn = async (provider: 'google' | 'discord') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithDiscord();
      }
    } catch (error) {
      // Errors are handled in the auth context
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
      </h2>

      {/* Social Login Buttons */}
      <div className="space-y-3 mb-6">
        <Button 
          type="button" 
          className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          <Google size={18} />
          <span>{mode === "login" ? "Sign in" : "Sign up"} with Google</span>
        </Button>

        <Button 
          type="button" 
          className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4a56d9]"
          onClick={() => handleOAuthSignIn('discord')}
          disabled={isLoading}
        >
          <Discord size={18} />
          <span>{mode === "login" ? "Sign in" : "Sign up"} with Discord</span>
        </Button>
      </div>

      {/* Separator between social and email login */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-muted-foreground text-sm">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSectionWrapper title="Account Details" className="mb-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateEmail}
                  className={errors.email ? "border-destructive pl-10" : "pl-10"}
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {mode !== "forgotPassword" && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    className={errors.password ? "border-destructive pl-10 pr-10" : "pl-10 pr-10"}
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {mode === "signup" && !errors.password && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, number & symbol
                  </p>
                )}
              </div>
            )}
          </div>
        </FormSectionWrapper>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading..."
            : mode === "login"
            ? "Sign In"
            : mode === "signup"
            ? "Create Account"
            : "Send Reset Link"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === "login" ? (
          <>
            <button
              onClick={() => switchMode("forgotPassword")}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
            <div className="mt-2">
              Don't have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </>
        ) : mode === "signup" ? (
          <div>
            Already have an account?{" "}
            <button
              onClick={() => switchMode("login")}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div>
            Remember your password?{" "}
            <button
              onClick={() => switchMode("login")}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
