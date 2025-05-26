export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collection_personas: {
        Row: {
          added_at: string
          collection_id: string
          id: string
          persona_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          id?: string
          persona_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_personas_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          persona_id: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          persona_id?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          persona_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          persona_ids: string[]
          project_id: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_ids?: string[]
          project_id: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_ids?: string[]
          project_id?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          audio_url: string | null
          consent_accepted: boolean | null
          consent_date: string | null
          created_at: string | null
          email: string
          id: string
          interview_completed: boolean | null
          interview_unlocked: boolean | null
          questionnaire_data: Json | null
          screener_passed: boolean | null
          transcript_url: string | null
          unique_identifier: string | null
          unlock_code: string | null
        }
        Insert: {
          audio_url?: string | null
          consent_accepted?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          email: string
          id?: string
          interview_completed?: boolean | null
          interview_unlocked?: boolean | null
          questionnaire_data?: Json | null
          screener_passed?: boolean | null
          transcript_url?: string | null
          unique_identifier?: string | null
          unlock_code?: string | null
        }
        Update: {
          audio_url?: string | null
          consent_accepted?: boolean | null
          consent_date?: string | null
          created_at?: string | null
          email?: string
          id?: string
          interview_completed?: boolean | null
          interview_unlocked?: boolean | null
          questionnaire_data?: Json | null
          screener_passed?: boolean | null
          transcript_url?: string | null
          unique_identifier?: string | null
          unlock_code?: string | null
        }
        Relationships: []
      }
      persona_images: {
        Row: {
          created_at: string | null
          file_path: string
          id: string
          is_current: boolean | null
          original_url: string | null
          persona_id: string
          storage_url: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          persona_id: string
          storage_url: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          persona_id?: string
          storage_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_images_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      personas: {
        Row: {
          behavioral_modulation: Json
          created_at: string | null
          creation_date: string
          id: string
          interview_sections: Json
          is_public: boolean | null
          linguistic_profile: Json
          metadata: Json
          name: string
          persona_id: string
          preinterview_tags: Json
          profile_image_url: string | null
          prompt: string | null
          simulation_directives: Json
          trait_profile: Json
          user_id: string | null
        }
        Insert: {
          behavioral_modulation: Json
          created_at?: string | null
          creation_date: string
          id?: string
          interview_sections: Json
          is_public?: boolean | null
          linguistic_profile: Json
          metadata: Json
          name: string
          persona_id: string
          preinterview_tags: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives: Json
          trait_profile: Json
          user_id?: string | null
        }
        Update: {
          behavioral_modulation?: Json
          created_at?: string | null
          creation_date?: string
          id?: string
          interview_sections?: Json
          is_public?: boolean | null
          linguistic_profile?: Json
          metadata?: Json
          name?: string
          persona_id?: string
          preinterview_tags?: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives?: Json
          trait_profile?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string | null
          encryption_iv: string | null
          encryption_key: string | null
          id: string
          key_present: boolean | null
          service: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_key?: string | null
          encryption_iv?: string | null
          encryption_key?: string | null
          id?: string
          key_present?: boolean | null
          service: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string | null
          encryption_iv?: string | null
          encryption_key?: string | null
          id?: string
          key_present?: boolean | null
          service?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
