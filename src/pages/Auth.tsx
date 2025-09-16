
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const Auth = () => {
  const { user, session, signIn, signUp, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  // Debug mode toggle
  const showDebug = searchParams.get('authdebug') === '1';

  // Handle redirection if user is already logged in
  useEffect(() => {
    console.log("Auth page - Current user state:", user);
    if (user) {
      console.log("User is already authenticated, redirecting to home page");
      
      // Check if we have a saved redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || "/";
      sessionStorage.removeItem('redirectAfterLogin'); // Clear the stored path
      
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      // Trim inputs before submission
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      if (!trimmedEmail || !trimmedPassword) {
        setAuthError("Please enter both email and password");
        return;
      }
      
      await signIn(trimmedEmail, trimmedPassword);
      // Auth context's useEffect will handle the redirect
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      // Trim inputs before submission
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      if (!trimmedEmail || !trimmedPassword) {
        setAuthError("Please enter both email and password");
        return;
      }
      
      await signUp(trimmedEmail, trimmedPassword);
      // After signup, we'll redirect to home or prompt to sign in
      setAuthError(null);
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      const trimmedEmail = resetEmail.trim();
      if (!trimmedEmail) {
        setAuthError("Please enter your email address");
        return;
      }
      
      await resetPassword(trimmedEmail);
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error: any) {
      setAuthError(error.message || "Failed to send reset email");
    }
  };

  // Trim inputs on blur to prevent trailing spaces
  const handleEmailBlur = () => setEmail(email.trim());
  const handlePasswordBlur = () => setPassword(password.trim());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-4">
          {/* Debug Panel */}
          {showDebug && (
            <Card className="border-yellow-500 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-sm">Auth Debug Panel</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <strong>Current User:</strong> {user ? `${user.email} (${user.id})` : 'None'}
                </div>
                <div>
                  <strong>Session:</strong> {session ? 'Active' : 'None'}
                </div>
                <div>
                  <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Last Error:</strong> {authError || 'None'}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
              <CardDescription>Enter your email and password to sign in</CardDescription>
            </CardHeader>
            
            {showResetPassword ? (
              /* Reset Password Form */
              <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      placeholder="example@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-sm text-red-500 py-2">
                      {authError}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => setShowResetPassword(false)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Send Reset Email
                  </Button>
                </CardFooter>
              </form>
            ) : (
              /* Main Auth Forms */
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn}>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleEmailBlur}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={handlePasswordBlur}
                          required
                        />
                      </div>
                      
                      {authError && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {authError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                      <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                      </Button>
                      <Button 
                        variant="link" 
                        type="button" 
                        onClick={() => setShowResetPassword(true)}
                        className="text-sm"
                      >
                        Forgot your password?
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input 
                          id="signup-email" 
                          type="email" 
                          placeholder="example@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleEmailBlur}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input 
                          id="signup-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={handlePasswordBlur}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters
                        </p>
                      </div>
                      
                      {authError && (
                        <Alert variant="destructive">
                          <AlertDescription>
                            {authError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Auth;
