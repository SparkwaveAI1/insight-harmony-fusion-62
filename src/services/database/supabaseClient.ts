
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

// Default to empty string if env vars are not defined
// In production, these would be set in the environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client when credentials are missing
const createMockClient = () => {
  console.warn('Supabase credentials missing. Using mock client.');
  
  // Return a mock client with empty methods
  return {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

// Create real client if we have credentials, otherwise use mock
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient() as unknown as ReturnType<typeof createClient<Database>>;

export default supabase;
