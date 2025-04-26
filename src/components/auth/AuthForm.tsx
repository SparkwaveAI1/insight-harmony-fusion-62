
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";
import Card from "@/components/ui-custom/Card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup" | "forgotPassword";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, resetPassword, isLoading } = useAuth();
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

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSectionWrapper title="Account Details" className="mb-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                className={errors.email ? "border-destructive" : ""}
                disabled={isLoading}
              />
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
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
