
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthSessionState {
  session: Session | null;
  isValidating: boolean;
  lastRefresh: number;
}

export const useAuthSession = () => {
  const [authState, setAuthState] = useState<AuthSessionState>({
    session: null,
    isValidating: false,
    lastRefresh: 0
  });

  // Enhanced session validation for mobile devices
  const validateSession = useCallback(async (forceRefresh = false): Promise<Session | null> => {
    const now = Date.now();
    const timeSinceLastRefresh = now - authState.lastRefresh;
    
    // Force refresh if requested or if it's been more than 5 minutes
    const shouldRefresh = forceRefresh || timeSinceLastRefresh > 5 * 60 * 1000;
    
    if (!shouldRefresh && authState.session) {
      return authState.session;
    }

    setAuthState(prev => ({ ...prev, isValidating: true }));

    try {
      console.log('Validating/refreshing session for mobile...');
      
      // Get fresh session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('Session refresh failed:', refreshError);
          setAuthState({ session: null, isValidating: false, lastRefresh: now });
          return null;
        }
        
        setAuthState({ 
          session: refreshData.session, 
          isValidating: false, 
          lastRefresh: now 
        });
        return refreshData.session;
      }

      setAuthState({ session, isValidating: false, lastRefresh: now });
      return session;
    } catch (error) {
      console.error('Session validation failed:', error);
      setAuthState({ session: null, isValidating: false, lastRefresh: now });
      return null;
    }
  }, [authState.session, authState.lastRefresh]);

  // Handle app state changes (for iOS Safari background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App returned to foreground, validating session...');
        validateSession(true);
      }
    };

    const handlePageShow = () => {
      console.log('Page show event, validating session...');
      validateSession(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [validateSession]);

  // Initialize session
  useEffect(() => {
    validateSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          lastRefresh: Date.now() 
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    session: authState.session,
    isValidating: authState.isValidating,
    validateSession,
    isAuthenticated: !!authState.session
  };
};
