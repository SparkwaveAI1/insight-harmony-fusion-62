
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
}
