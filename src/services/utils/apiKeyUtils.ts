import { supabase } from '@/integrations/supabase/client';

/**
 * API Key Utilities - Secure Server-Side Storage
 * 
 * SECURITY: API keys are ONLY stored server-side in encrypted form.
 * localStorage is NOT used for key storage (XSS vulnerability).
 * 
 * For authenticated users: Keys stored in user_api_keys table (encrypted)
 * For unauthenticated users: Keys must be provided per-request (not stored)
 */

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get current user ID (if authenticated)
const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
};

/**
 * Store an API key securely (server-side only)
 * Requires authentication - unauthenticated users cannot store keys
 */
export const setApiKey = async (service: string, key: string): Promise<boolean> => {
  try {
    const isUserAuth = await isAuthenticated();
    
    if (!isUserAuth) {
      console.warn('Cannot store API key: user not authenticated. Keys must be provided per-request for unauthenticated users.');
      return false;
    }
    
    // Store the key securely through the Edge Function
    const { error } = await supabase.functions.invoke('store-api-key', {
      body: { apiKey: key, service }
    });
    
    if (error) {
      console.error('Error storing API key:', error);
      return false;
    }
    
    // Set a session-only flag (not persisted across browser restarts)
    // This is safe because it doesn't contain the actual key
    sessionStorage.setItem(`${service}_key_stored`, 'true');
    
    // Clean up any legacy localStorage entries (security migration)
    cleanupLegacyStorage(service);
    
    return true;
  } catch (error) {
    console.error('Error in setApiKey:', error);
    return false;
  }
};

/**
 * Check if user has a stored API key for a service
 * Returns 'stored-key' marker if key exists server-side
 * Returns null if no key stored
 */
export const getApiKey = async (service: string): Promise<string | null> => {
  try {
    const isUserAuth = await isAuthenticated();
    
    if (!isUserAuth) {
      // Unauthenticated users don't have stored keys
      return null;
    }
    
    // Check session flag first (fast path)
    if (sessionStorage.getItem(`${service}_key_stored`) === 'true') {
      return 'stored-key';
    }
    
    // Check server for stored key
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('key_present')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();
    
    if (error || !data?.key_present) {
      return null;
    }
    
    // Set session flag for fast subsequent lookups
    sessionStorage.setItem(`${service}_key_stored`, 'true');
    return 'stored-key';
    
  } catch (error) {
    console.error('Error in getApiKey:', error);
    return null;
  }
};

/**
 * Synchronous version for backward compatibility
 * Checks session storage for the marker (set after successful server check)
 * DEPRECATED: Use async getApiKey() instead
 */
export const getApiKeySync = (service: string): string | null => {
  // Only check session storage (which was set after a successful server verification)
  if (sessionStorage.getItem(`${service}_key_stored`) === 'true') {
    return 'stored-key';
  }
  return null;
};

/**
 * Get all stored API keys info (not the actual keys)
 * Returns which services have stored keys
 */
export const getApiKeys = async (): Promise<Record<string, boolean>> => {
  try {
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) return {};
    
    const userId = await getCurrentUserId();
    if (!userId) return {};
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('service, key_present')
      .eq('user_id', userId);
    
    if (error || !data) return {};
    
    const keys: Record<string, boolean> = {};
    for (const row of data) {
      if (row.key_present) {
        keys[row.service] = true;
      }
    }
    return keys;
    
  } catch (error) {
    console.error('Error in getApiKeys:', error);
    return {};
  }
};

/**
 * Remove an API key
 */
export const removeApiKey = async (service: string): Promise<boolean> => {
  try {
    const isUserAuth = await isAuthenticated();
    
    // Clear session storage
    sessionStorage.removeItem(`${service}_key_stored`);
    
    // Clean up legacy localStorage
    cleanupLegacyStorage(service);
    
    if (!isUserAuth) {
      return true; // Nothing server-side to remove
    }
    
    // Remove the key through the Edge Function
    const { error } = await supabase.functions.invoke('remove-api-key', {
      body: { service }
    });
    
    if (error) {
      console.error('Error removing API key:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeApiKey:', error);
    return false;
  }
};

/**
 * Clear all API keys
 */
export const clearApiKeys = async (): Promise<void> => {
  // Clear all session storage markers
  const services = ['openai', 'anthropic', 'grok'];
  for (const service of services) {
    sessionStorage.removeItem(`${service}_key_stored`);
    cleanupLegacyStorage(service);
  }
  
  // Clean up legacy localStorage
  localStorage.removeItem('apiKeys');
  
  // Try to clear keys in the database if authenticated
  try {
    const isUserAuth = await isAuthenticated();
    if (isUserAuth) {
      for (const service of services) {
        await supabase.functions.invoke('remove-api-key', {
          body: { service }
        });
      }
    }
  } catch (error) {
    console.error('Error clearing API keys from database:', error);
  }
};

/**
 * Clean up legacy localStorage entries (security migration)
 * Removes any API keys that were stored in localStorage
 */
const cleanupLegacyStorage = (service?: string): void => {
  try {
    // Remove old apiKeys object from localStorage
    const oldKeys = localStorage.getItem('apiKeys');
    if (oldKeys) {
      console.warn('Security: Removing legacy API keys from localStorage');
      localStorage.removeItem('apiKeys');
    }
    
    // Remove old stored key markers
    if (service) {
      localStorage.removeItem(`${service}_key_stored`);
    } else {
      // Clean all known services
      const services = ['openai', 'anthropic', 'grok', 'xai'];
      for (const s of services) {
        localStorage.removeItem(`${s}_key_stored`);
      }
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
};

/**
 * Initialize and migrate - call on app startup
 * Cleans up any legacy localStorage API keys
 */
export const initializeApiKeyStorage = async (): Promise<void> => {
  // Clean up all legacy localStorage entries
  cleanupLegacyStorage();
  
  // If user is authenticated, verify session storage flags match server state
  const isUserAuth = await isAuthenticated();
  if (isUserAuth) {
    const serverKeys = await getApiKeys();
    const services = ['openai', 'anthropic', 'grok'];
    
    for (const service of services) {
      if (serverKeys[service]) {
        sessionStorage.setItem(`${service}_key_stored`, 'true');
      } else {
        sessionStorage.removeItem(`${service}_key_stored`);
      }
    }
  }
};

// For backward compatibility
export const saveApiKey = setApiKey;
