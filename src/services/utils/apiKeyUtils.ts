
import { supabase } from '@/integrations/supabase/client';

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Store an API key in the database
export const setApiKey = async (service: string, key: string): Promise<boolean> => {
  try {
    // Check if the user is authenticated
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) {
      // Fall back to localStorage for unauthenticated users
      const keys = getApiKeys();
      keys[service] = key;
      localStorage.setItem('apiKeys', JSON.stringify(keys));
      return true;
    }
    
    // Store the key securely through the Edge Function
    const { error } = await supabase.functions.invoke('store-api-key', {
      body: { apiKey: key, service }
    });
    
    if (error) {
      console.error('Error storing API key:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setApiKey:', error);
    // Fall back to localStorage on error
    const keys = getApiKeys();
    keys[service] = key;
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    return false;
  }
};

// Get all API keys from storage
export const getApiKeys = (): Record<string, string> => {
  const keys = localStorage.getItem('apiKeys');
  return keys ? JSON.parse(keys) : {};
};

// Get a specific API key
export const getApiKey = (service: string): string | null => {
  // First check if we're using a stored key in the database
  if (service === 'openai') {
    // Check if we have a marker for a stored key
    const storedKeyMarker = localStorage.getItem('openai_key_stored');
    if (storedKeyMarker === 'true') {
      return 'stored-key';
    }
  }
  
  // Fall back to localStorage
  const keys = getApiKeys();
  return keys[service] || null;
};

// Remove an API key
export const removeApiKey = async (service: string): Promise<boolean> => {
  try {
    // Check if the user is authenticated
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) {
      // Just remove from localStorage
      const keys = getApiKeys();
      delete keys[service];
      localStorage.setItem('apiKeys', JSON.stringify(keys));
      return true;
    }
    
    // Remove the key through the Edge Function
    const { error } = await supabase.functions.invoke('remove-api-key', {
      body: { service }
    });
    
    if (error) {
      console.error('Error removing API key:', error);
      return false;
    }
    
    // Also clear from localStorage
    const keys = getApiKeys();
    delete keys[service];
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    
    // Remove the stored key marker
    if (service === 'openai') {
      localStorage.removeItem('openai_key_stored');
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeApiKey:', error);
    // Fall back to localStorage on error
    const keys = getApiKeys();
    delete keys[service];
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    return false;
  }
};

// Clear all API keys
export const clearApiKeys = async (): Promise<void> => {
  localStorage.removeItem('apiKeys');
  localStorage.removeItem('openai_key_stored');
  
  // Try to clear keys in the database if authenticated
  try {
    const isUserAuth = await isAuthenticated();
    if (isUserAuth) {
      await supabase.functions.invoke('remove-api-key', {
        body: { service: 'openai' }
      });
    }
  } catch (error) {
    console.error('Error clearing API keys from database:', error);
  }
};

// For backward compatibility
export const saveApiKey = setApiKey;
