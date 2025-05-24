
/// <reference types="vite/client" />

// Define the table_exists RPC function type
interface Database {
  public: {
    Functions: {
      table_exists: {
        Args: { table_name: string }
        Returns: { exists: boolean }
      }
    }
  }
}

// Extend the original Database type from Supabase
declare module '@/integrations/supabase/types' {
  interface Database {
    public: {
      Functions: {
        table_exists: {
          Args: { table_name: string }
          Returns: { exists: boolean }
        }
      }
    }
  }
  
  // Export Json type that was missing
  export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]
}
