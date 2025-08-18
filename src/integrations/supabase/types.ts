export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
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
          file_attachments: Json | null
          id: string
          persona_id: string | null
          responding_persona_id: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_attachments?: Json | null
          id?: string
          persona_id?: string | null
          responding_persona_id?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_attachments?: Json | null
          id?: string
          persona_id?: string | null
          responding_persona_id?: string | null
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
          active_persona_ids: string[] | null
          auto_mode: boolean | null
          created_at: string
          id: string
          persona_ids: string[]
          project_id: string | null
          session_type: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_persona_ids?: string[] | null
          auto_mode?: boolean | null
          created_at?: string
          id?: string
          persona_ids?: string[]
          project_id?: string | null
          session_type?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_persona_ids?: string[] | null
          auto_mode?: boolean | null
          created_at?: string
          id?: string
          persona_ids?: string[]
          project_id?: string | null
          session_type?: string | null
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
      featured_character_videos: {
        Row: {
          character_id: string
          character_type: string
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          thumbnail_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          character_id: string
          character_type: string
          created_at?: string
          description: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          character_id?: string
          character_type?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      knowledge_base_documents: {
        Row: {
          content: string | null
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          image_data: string | null
          image_url: string | null
          is_image: boolean | null
          project_id: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          is_image?: boolean | null
          project_id: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          is_image?: boolean | null
          project_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      non_humanoid_character_images: {
        Row: {
          character_id: string
          created_at: string | null
          file_path: string
          generation_prompt: string | null
          id: string
          is_current: boolean | null
          original_url: string | null
          physical_attributes: Json | null
          storage_url: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          file_path: string
          generation_prompt?: string | null
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          physical_attributes?: Json | null
          storage_url: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          file_path?: string
          generation_prompt?: string | null
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          physical_attributes?: Json | null
          storage_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_humanoid_character_images_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "non_humanoid_characters"
            referencedColumns: ["character_id"]
          },
        ]
      }
      non_humanoid_characters: {
        Row: {
          appearance_prompt: string | null
          behavioral_modulation: Json
          character_id: string
          character_type: string
          created_at: string
          creation_date: string
          emotional_triggers: Json | null
          enhanced_metadata_version: number | null
          form_factor: string | null
          id: string
          interview_sections: Json
          is_public: boolean | null
          linguistic_profile: Json
          metadata: Json
          name: string
          origin_universe: string | null
          preinterview_tags: Json
          profile_image_url: string | null
          prompt: string | null
          simulation_directives: Json
          species_type: string
          trait_profile: Json
          user_id: string | null
        }
        Insert: {
          appearance_prompt?: string | null
          behavioral_modulation?: Json
          character_id: string
          character_type?: string
          created_at?: string
          creation_date: string
          emotional_triggers?: Json | null
          enhanced_metadata_version?: number | null
          form_factor?: string | null
          id?: string
          interview_sections?: Json
          is_public?: boolean | null
          linguistic_profile?: Json
          metadata?: Json
          name: string
          origin_universe?: string | null
          preinterview_tags?: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives?: Json
          species_type: string
          trait_profile: Json
          user_id?: string | null
        }
        Update: {
          appearance_prompt?: string | null
          behavioral_modulation?: Json
          character_id?: string
          character_type?: string
          created_at?: string
          creation_date?: string
          emotional_triggers?: Json | null
          enhanced_metadata_version?: number | null
          form_factor?: string | null
          id?: string
          interview_sections?: Json
          is_public?: boolean | null
          linguistic_profile?: Json
          metadata?: Json
          name?: string
          origin_universe?: string | null
          preinterview_tags?: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives?: Json
          species_type?: string
          trait_profile?: Json
          user_id?: string | null
        }
        Relationships: []
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
          generation_prompt: string | null
          id: string
          is_current: boolean | null
          original_url: string | null
          persona_id: string
          physical_attributes: Json | null
          storage_url: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          generation_prompt?: string | null
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          persona_id: string
          physical_attributes?: Json | null
          storage_url: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          generation_prompt?: string | null
          id?: string
          is_current?: boolean | null
          original_url?: string | null
          persona_id?: string
          physical_attributes?: Json | null
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
          description: string | null
          emotional_triggers: Json | null
          enhanced_metadata_version: number | null
          id: string
          interview_sections: Json
          is_public: boolean | null
          linguistic_profile: Json
          metadata: Json
          name: string
          persona_id: string
          persona_version: string | null
          preinterview_tags: Json
          profile_image_url: string | null
          prompt: string | null
          simulation_directives: Json
          trait_profile: Json
          user_id: string | null
          voicepack_runtime: Json | null
        }
        Insert: {
          behavioral_modulation: Json
          created_at?: string | null
          creation_date: string
          description?: string | null
          emotional_triggers?: Json | null
          enhanced_metadata_version?: number | null
          id?: string
          interview_sections: Json
          is_public?: boolean | null
          linguistic_profile: Json
          metadata: Json
          name: string
          persona_id: string
          persona_version?: string | null
          preinterview_tags: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives: Json
          trait_profile: Json
          user_id?: string | null
          voicepack_runtime?: Json | null
        }
        Update: {
          behavioral_modulation?: Json
          created_at?: string | null
          creation_date?: string
          description?: string | null
          emotional_triggers?: Json | null
          enhanced_metadata_version?: number | null
          id?: string
          interview_sections?: Json
          is_public?: boolean | null
          linguistic_profile?: Json
          metadata?: Json
          name?: string
          persona_id?: string
          persona_version?: string | null
          preinterview_tags?: Json
          profile_image_url?: string | null
          prompt?: string | null
          simulation_directives?: Json
          trait_profile?: Json
          user_id?: string | null
          voicepack_runtime?: Json | null
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
      project_collections: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_question_sets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          questions: Json
          status: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          questions?: Json
          status?: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          questions?: Json
          status?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          information: string | null
          methodology: string | null
          name: string
          research_objectives: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          information?: string | null
          methodology?: string | null
          name: string
          research_objectives?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          information?: string | null
          methodology?: string | null
          name?: string
          research_objectives?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prsna_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      research_reports: {
        Row: {
          created_at: string
          id: string
          insights: Json
          survey_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insights?: Json
          survey_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insights?: Json
          survey_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_survey_responses: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          question_index: number
          question_text: string
          response_text: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          question_index: number
          question_text: string
          response_text: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          question_index?: number
          question_text?: string
          response_text?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_survey_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "research_survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      research_survey_sessions: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          id: string
          research_context: Json | null
          research_survey_id: string
          selected_personas: string[]
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          research_context?: Json | null
          research_survey_id: string
          selected_personas?: string[]
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          research_context?: Json | null
          research_survey_id?: string
          selected_personas?: string[]
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_survey_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_survey_sessions_research_survey_id_fkey"
            columns: ["research_survey_id"]
            isOneToOne: false
            referencedRelation: "research_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      research_surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          questions: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          questions?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          questions?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_surveys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      structured_study_sessions: {
        Row: {
          audience_definition: Json | null
          created_at: string
          current_step: number
          id: string
          output_goals: Json | null
          research_format: Json | null
          status: string
          study_goal: Json | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_definition?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          output_goals?: Json | null
          research_format?: Json | null
          status?: string
          study_goal?: Json | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_definition?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          output_goals?: Json | null
          research_format?: Json | null
          status?: string
          study_goal?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          question_index: number
          question_text: string
          response_text: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          question_index: number
          question_text: string
          response_text: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          question_index?: number
          question_text?: string
          response_text?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "survey_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_question_index: number
          id: string
          persona_id: string
          started_at: string | null
          status: string
          survey_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_question_index?: number
          id?: string
          persona_id: string
          started_at?: string | null
          status?: string
          survey_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_question_index?: number
          id?: string
          persona_id?: string
          started_at?: string | null
          status?: string
          survey_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_sessions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          questions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          questions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          questions?: Json
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
      voicepack_chat_telemetry: {
        Row: {
          avg_sentence_length: number | null
          banned_frame_hits: number | null
          classification: Json | null
          conversation_id: string | null
          created_at: string
          estimated_tokens: number | null
          id: string
          latency_ms: number | null
          must_include_satisfied: boolean | null
          persona_id: string
          plan: Json | null
          response_shape: string | null
          rhetorical_q_count: number | null
          signature_token_count: number | null
          user_id: string
          voicepack_hash: string | null
        }
        Insert: {
          avg_sentence_length?: number | null
          banned_frame_hits?: number | null
          classification?: Json | null
          conversation_id?: string | null
          created_at?: string
          estimated_tokens?: number | null
          id?: string
          latency_ms?: number | null
          must_include_satisfied?: boolean | null
          persona_id: string
          plan?: Json | null
          response_shape?: string | null
          rhetorical_q_count?: number | null
          signature_token_count?: number | null
          user_id: string
          voicepack_hash?: string | null
        }
        Update: {
          avg_sentence_length?: number | null
          banned_frame_hits?: number | null
          classification?: Json | null
          conversation_id?: string | null
          created_at?: string
          estimated_tokens?: number | null
          id?: string
          latency_ms?: number | null
          must_include_satisfied?: boolean | null
          persona_id?: string
          plan?: Json | null
          response_shape?: string | null
          rhetorical_q_count?: number | null
          signature_token_count?: number | null
          user_id?: string
          voicepack_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_participant_identifier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_projects_with_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversation_count: number
          created_at: string
          description: string
          id: string
          information: string
          methodology: string
          name: string
          research_objectives: string
          updated_at: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
