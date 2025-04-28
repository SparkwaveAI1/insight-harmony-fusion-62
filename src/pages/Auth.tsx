
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Logo from '@/components/ui-custom/Logo';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        console.error("Login error:", error.message);
        toast.error(error.message || 'Failed to sign in');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        console.error("Signup error:", error.message);
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Account created! Please check your email to confirm your registration.');
        setActiveTab('login');
        signupForm.reset();
      }
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto mb-4 text-white" />
          <h1 className="text-3xl font-bold text-white">Welcome to PersonaAI</h1>
          <p className="text-slate-300 mt-2">Sign in to access your personas and research</p>
        </div>
        
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-slate-400">
            <div>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
