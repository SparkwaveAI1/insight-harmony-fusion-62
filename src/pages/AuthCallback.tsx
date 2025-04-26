
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session from the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        toast.error('Authentication error: ' + error.message);
        navigate('/auth');
        return;
      }

      if (data.session) {
        toast.success('Successfully signed in!');
        navigate('/');
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h1 className="text-2xl font-semibold mb-2">Processing authentication...</h1>
      <p className="text-muted-foreground">Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default AuthCallback;
