
/// <reference types="vite/client" />

// Define the table_exists RPC function type
interface Database {
  public: {
    Functions: {
      table_exists: {
        Args: { table_name: string }
        Returns: { exists: boolean }
      }
      array_append_element: {
        Args: { 
          table_name: string;
          column_name: string;
          row_id: string;
          new_element: string;
        }
        Returns: void
      }
      array_remove_element: {
        Args: { 
          table_name: string;
          column_name: string;
          row_id: string;
          element_to_remove: string;
        }
        Returns: void
      }
    }
    Tables: {
      research_projects: {
        Row: {
          id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          instructions: string | null;
          persona_ids: string[];
          collection_ids: string[];
          media_ids: string[];
          session_ids: string[];
        }
        Insert: {
          id?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          instructions?: string | null;
          persona_ids?: string[];
          collection_ids?: string[];
          media_ids?: string[];
          session_ids?: string[];
        }
        Update: {
          id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string | null;
          instructions?: string | null;
          persona_ids?: string[];
          collection_ids?: string[];
          media_ids?: string[];
          session_ids?: string[];
        }
      }
      research_media: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          file_url: string;
          original_name: string;
          created_at: string;
          updated_at: string;
          is_processed: boolean | null;
          text_content: string | null;
          metadata: any | null;
        }
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          file_url: string;
          original_name: string;
          created_at?: string;
          updated_at?: string;
          is_processed?: boolean | null;
          text_content?: string | null;
          metadata?: any | null;
        }
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string;
          original_name?: string;
          created_at?: string;
          updated_at?: string;
          is_processed?: boolean | null;
          text_content?: string | null;
          metadata?: any | null;
        }
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
        array_append_element: {
          Args: { 
            table_name: string;
            column_name: string;
            row_id: string;
            new_element: string;
          }
          Returns: void
        }
        array_remove_element: {
          Args: { 
            table_name: string;
            column_name: string;
            row_id: string;
            element_to_remove: string;
          }
          Returns: void
        }
      }
      Tables: {
        research_projects: {
          Row: {
            id: string;
            created_by: string;
            created_at: string;
            updated_at: string;
            title: string;
            description: string | null;
            instructions: string | null;
            persona_ids: string[];
            collection_ids: string[];
            media_ids: string[];
            session_ids: string[];
          }
          Insert: {
            id?: string;
            created_by: string;
            created_at?: string;
            updated_at?: string;
            title: string;
            description?: string | null;
            instructions?: string | null;
            persona_ids?: string[];
            collection_ids?: string[];
            media_ids?: string[];
            session_ids?: string[];
          }
          Update: {
            id?: string;
            created_by?: string;
            created_at?: string;
            updated_at?: string;
            title?: string;
            description?: string | null;
            instructions?: string | null;
            persona_ids?: string[];
            collection_ids?: string[];
            media_ids?: string[];
            session_ids?: string[];
          }
        }
        research_media: {
          Row: {
            id: string;
            user_id: string;
            project_id: string;
            file_name: string;
            file_path: string;
            file_type: string;
            file_size: number;
            file_url: string;
            original_name: string;
            created_at: string;
            updated_at: string;
            is_processed: boolean | null;
            text_content: string | null;
            metadata: any | null;
          }
          Insert: {
            id?: string;
            user_id: string;
            project_id: string;
            file_name: string;
            file_path: string;
            file_type: string;
            file_size: number;
            file_url: string;
            original_name: string;
            created_at?: string;
            updated_at?: string;
            is_processed?: boolean | null;
            text_content?: string | null;
            metadata?: any | null;
          }
          Update: {
            id?: string;
            user_id?: string;
            project_id?: string;
            file_name?: string;
            file_path?: string;
            file_type?: string;
            file_size?: number;
            file_url?: string;
            original_name?: string;
            created_at?: string;
            updated_at?: string;
            is_processed?: boolean | null;
            text_content?: string | null;
            metadata?: any | null;
          }
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
