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
      admin_alerts: {
        Row: {
          created_at: string
          dismissed_at: string | null
          dismissed_by: string | null
          id: string
          message: string
          metadata: Json
          severity: string
          status: string
          type: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          message: string
          metadata?: Json
          severity?: string
          status?: string
          type: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          message?: string
          metadata?: Json
          severity?: string
          status?: string
          type?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_credit_ledger: {
        Row: {
          action_ref: string | null
          action_type: string | null
          created_at: string
          credits_delta: number
          idempotency_key: string | null
          ledger_id: string
          metadata: Json
          org_id: string | null
          source: string
          status: string
          user_id: string
        }
        Insert: {
          action_ref?: string | null
          action_type?: string | null
          created_at?: string
          credits_delta: number
          idempotency_key?: string | null
          ledger_id?: string
          metadata?: Json
          org_id?: string | null
          source: string
          status: string
          user_id: string
        }
        Update: {
          action_ref?: string | null
          action_type?: string | null
          created_at?: string
          credits_delta?: number
          idempotency_key?: string | null
          ledger_id?: string
          metadata?: Json
          org_id?: string | null
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_feature_access: {
        Row: {
          enabled: boolean
          feature_id: string
          feature_key: string
          plan_id: string
          thresholds: Json
        }
        Insert: {
          enabled?: boolean
          feature_id?: string
          feature_key: string
          plan_id: string
          thresholds?: Json
        }
        Update: {
          enabled?: boolean
          feature_id?: string
          feature_key?: string
          plan_id?: string
          thresholds?: Json
        }
        Relationships: [
          {
            foreignKeyName: "billing_feature_access_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          created_at: string | null
          included_credits: number
          is_active: boolean
          name: string
          plan_id: string
          price_usd: number
        }
        Insert: {
          created_at?: string | null
          included_credits?: number
          is_active?: boolean
          name: string
          plan_id?: string
          price_usd?: number
        }
        Update: {
          created_at?: string | null
          included_credits?: number
          is_active?: boolean
          name?: string
          plan_id?: string
          price_usd?: number
        }
        Relationships: []
      }
      billing_price_book: {
        Row: {
          action_type: string
          credits_cost: number
          effective_from: string
          effective_to: string | null
          grace_pct: number
          is_active: boolean
          model: string | null
          price_id: string
        }
        Insert: {
          action_type: string
          credits_cost: number
          effective_from?: string
          effective_to?: string | null
          grace_pct?: number
          is_active?: boolean
          model?: string | null
          price_id?: string
        }
        Update: {
          action_type?: string
          credits_cost?: number
          effective_from?: string
          effective_to?: string | null
          grace_pct?: number
          is_active?: boolean
          model?: string | null
          price_id?: string
        }
        Relationships: []
      }
      billing_profiles: {
        Row: {
          auto_renew: boolean
          created_at: string | null
          plan_id: string | null
          renewal_date: string | null
          stripe_customer_id: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string | null
          plan_id?: string | null
          renewal_date?: string | null
          stripe_customer_id?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string | null
          plan_id?: string | null
          renewal_date?: string | null
          stripe_customer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      billing_states: {
        Row: {
          created_at: string
          dunning_stage: number
          last_invoice_id: string | null
          plan_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dunning_stage?: number
          last_invoice_id?: string | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dunning_stage?: number
          last_invoice_id?: string | null
          plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_states_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      billing_transactions: {
        Row: {
          amount_usd: number | null
          created_at: string
          credits_purchased: number | null
          provider: string | null
          provider_ref: string | null
          transaction_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount_usd?: number | null
          created_at?: string
          credits_purchased?: number | null
          provider?: string | null
          provider_ref?: string | null
          transaction_id?: string
          type: string
          user_id: string
        }
        Update: {
          amount_usd?: number | null
          created_at?: string
          credits_purchased?: number | null
          provider?: string | null
          provider_ref?: string | null
          transaction_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_usage_log: {
        Row: {
          action_type: string
          created_at: string
          credits_spent: number
          metadata: Json
          usage_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          credits_spent: number
          metadata?: Json
          usage_id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          credits_spent?: number
          metadata?: Json
          usage_id?: string
          user_id?: string
        }
        Relationships: []
      }
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
      global_memories: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          tags: string[] | null
          title: string | null
          type: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
          type: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
          type?: string
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
      participant_access_log: {
        Row: {
          access_type: string
          id: string
          ip_address: unknown
          participant_id: string
          timestamp: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          id?: string
          ip_address?: unknown
          participant_id: string
          timestamp?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          id?: string
          ip_address?: unknown
          participant_id?: string
          timestamp?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_access_log_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
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
      persona_creation_queue: {
        Row: {
          attempt_count: number | null
          collections: string[] | null
          completed_at: string | null
          created_at: string
          description: string
          error_message: string | null
          id: string
          locked_at: string | null
          name: string
          persona_id: string | null
          priority: number | null
          processed_at: string | null
          processing_started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_count?: number | null
          collections?: string[] | null
          completed_at?: string | null
          created_at?: string
          description: string
          error_message?: string | null
          id?: string
          locked_at?: string | null
          name: string
          persona_id?: string | null
          priority?: number | null
          processed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_count?: number | null
          collections?: string[] | null
          completed_at?: string | null
          created_at?: string
          description?: string
          error_message?: string | null
          id?: string
          locked_at?: string | null
          name?: string
          persona_id?: string | null
          priority?: number | null
          processed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      persona_memories: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          persona_id: string
          source: string | null
          tags: string[] | null
          title: string | null
          type: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          persona_id: string
          source?: string | null
          tags?: string[] | null
          title?: string | null
          type: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          persona_id?: string
          source?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      v4_personas: {
        Row: {
          age_computed: number | null
          background: string | null
          buying_style_tags: string[] | null
          city_computed: string | null
          conversation_summary: Json | null
          country_computed: string | null
          created_at: string | null
          creation_completed: boolean | null
          creation_stage: string | null
          education_level: string | null
          enhancement_applied_at: string | null
          enrichment_status: string | null
          evidence_notes: string | null
          full_profile: Json
          gender_computed: string | null
          has_children_computed: boolean | null
          health_tags: string[] | null
          income_bracket: string | null
          industry_tags: string[] | null
          interest_tags: string[] | null
          is_public: boolean
          marital_status_computed: string | null
          missing_fields: string[] | null
          name: string
          occupation_computed: string | null
          persona_id: string
          profile_image_url: string | null
          profile_thumbnail_url: string | null
          schema_version: string
          state_region_computed: string | null
          statistical_enhancement_status: string | null
          thought_coherence: number | null
          updated_at: string | null
          user_id: string
          work_role_tags: string[] | null
        }
        Insert: {
          age_computed?: number | null
          background?: string | null
          buying_style_tags?: string[] | null
          city_computed?: string | null
          conversation_summary?: Json | null
          country_computed?: string | null
          created_at?: string | null
          creation_completed?: boolean | null
          creation_stage?: string | null
          education_level?: string | null
          enhancement_applied_at?: string | null
          enrichment_status?: string | null
          evidence_notes?: string | null
          full_profile?: Json
          gender_computed?: string | null
          has_children_computed?: boolean | null
          health_tags?: string[] | null
          income_bracket?: string | null
          industry_tags?: string[] | null
          interest_tags?: string[] | null
          is_public?: boolean
          marital_status_computed?: string | null
          missing_fields?: string[] | null
          name: string
          occupation_computed?: string | null
          persona_id: string
          profile_image_url?: string | null
          profile_thumbnail_url?: string | null
          schema_version?: string
          state_region_computed?: string | null
          statistical_enhancement_status?: string | null
          thought_coherence?: number | null
          updated_at?: string | null
          user_id: string
          work_role_tags?: string[] | null
        }
        Update: {
          age_computed?: number | null
          background?: string | null
          buying_style_tags?: string[] | null
          city_computed?: string | null
          conversation_summary?: Json | null
          country_computed?: string | null
          created_at?: string | null
          creation_completed?: boolean | null
          creation_stage?: string | null
          education_level?: string | null
          enhancement_applied_at?: string | null
          enrichment_status?: string | null
          evidence_notes?: string | null
          full_profile?: Json
          gender_computed?: string | null
          has_children_computed?: boolean | null
          health_tags?: string[] | null
          income_bracket?: string | null
          industry_tags?: string[] | null
          interest_tags?: string[] | null
          is_public?: boolean
          marital_status_computed?: string | null
          missing_fields?: string[] | null
          name?: string
          occupation_computed?: string | null
          persona_id?: string
          profile_image_url?: string | null
          profile_thumbnail_url?: string | null
          schema_version?: string
          state_region_computed?: string | null
          statistical_enhancement_status?: string | null
          thought_coherence?: number | null
          updated_at?: string | null
          user_id?: string
          work_role_tags?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      billing_credit_available: {
        Row: {
          available: number | null
          user_id: string | null
        }
        Relationships: []
      }
      billing_credit_balances: {
        Row: {
          balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v4_personas_public_safe: {
        Row: {
          age: string | null
          character_description: string | null
          conversation_summary: Json | null
          created_at: string | null
          is_public: boolean | null
          location: string | null
          name: string | null
          occupation: string | null
          persona_id: string | null
          profile_image_url: string | null
          schema_version: string | null
          user_id: string | null
        }
        Insert: {
          age?: never
          character_description?: never
          conversation_summary?: Json | null
          created_at?: string | null
          is_public?: boolean | null
          location?: never
          name?: string | null
          occupation?: never
          persona_id?: string | null
          profile_image_url?: string | null
          schema_version?: string | null
          user_id?: string | null
        }
        Update: {
          age?: never
          character_description?: never
          conversation_summary?: Json | null
          created_at?: string | null
          is_public?: boolean | null
          location?: never
          name?: string | null
          occupation?: never
          persona_id?: string | null
          profile_image_url?: string | null
          schema_version?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      billing_available_credits: {
        Args: { p_user_id: string }
        Returns: number
      }
      billing_finalize_credits: {
        Args: {
          p_credits_final?: number
          p_ledger_id: string
          p_usage_metadata?: Json
        }
        Returns: string
      }
      billing_reserve_credits: {
        Args: {
          p_action_type: string
          p_idempotency_key?: string
          p_org_id?: string
          p_required_credits: number
          p_user_id: string
        }
        Returns: {
          available_after: number
          available_before: number
          ledger_id: string
        }[]
      }
      billing_reverse_credits: {
        Args: { p_ledger_id: string }
        Returns: undefined
      }
      cleanup_orphaned_persona_references: {
        Args: never
        Returns: {
          cleaned_count: number
        }[]
      }
      count_personas_in_collections: {
        Args: { collection_ids: string[] }
        Returns: {
          collection_id: string
          persona_count: number
        }[]
      }
      extract_conversation_summary: {
        Args: { full_profile_data: Json }
        Returns: Json
      }
      fail_stale_persona_jobs: { Args: never; Returns: undefined }
      find_orphaned_persona_references: {
        Args: never
        Returns: {
          collection_id: string
          collection_name: string
          persona_id: string
        }[]
      }
      fix_orphaned_persona_queue_items: { Args: never; Returns: undefined }
      generate_participant_identifier: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      get_queue_health_status: {
        Args: never
        Returns: {
          oldest_stuck_item: string
          processing_time_minutes: number
          total_pending: number
          total_processing: number
          total_stuck: number
        }[]
      }
      get_user_projects_with_counts: {
        Args: never
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
      get_users_renewing_in_days: {
        Args: { days_ahead: number }
        Returns: {
          email: string
          id: string
          plan_name: string
          price_usd: number
          renewal_date: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_researcher_or_admin: { Args: { _user_id: string }; Returns: boolean }
      manual_clear_queue_item: {
        Args: { clear_reason?: string; item_id: string }
        Returns: {
          attempt_count: number | null
          collections: string[] | null
          completed_at: string | null
          created_at: string
          description: string
          error_message: string | null
          id: string
          locked_at: string | null
          name: string
          persona_id: string | null
          priority: number | null
          processed_at: string | null
          processing_started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "persona_creation_queue"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_question: { Args: { q: Json }; Returns: Json }
      pop_next_persona_queue: {
        Args: never
        Returns: {
          attempt_count: number | null
          collections: string[] | null
          completed_at: string | null
          created_at: string
          description: string
          error_message: string | null
          id: string
          locked_at: string | null
          name: string
          persona_id: string | null
          priority: number | null
          processed_at: string | null
          processing_started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "persona_creation_queue"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_personas_advanced: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_bmi_max?: number
          p_bmi_min?: number
          p_collection_ids?: string[]
          p_diet_keywords?: string[]
          p_education?: string
          p_income_bracket?: string
          p_interest_keywords?: string[]
          p_lifestyle_keywords?: string[]
          p_limit?: number
          p_location_country?: string
          p_location_region?: string
          p_occupation_keywords?: string[]
        }
        Returns: {
          conversation_summary: Json
          full_profile: Json
          name: string
          persona_id: string
          profile_image_url: string
          relevance_score: number
        }[]
      }
      search_personas_stage1: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_city?: string
          p_collection_ids?: string[]
          p_country?: string
          p_gender?: string[]
          p_has_children?: boolean
          p_health_tags?: string[]
          p_industry_tags?: string[]
          p_interest_tags?: string[]
          p_limit?: number
          p_marital_status?: string[]
          p_occupation_keywords?: string[]
          p_state_region?: string
          p_work_role_tags?: string[]
        }
        Returns: {
          age_computed: number
          city_computed: string
          conversation_summary: Json
          country_computed: string
          full_profile: Json
          gender_computed: string
          has_children_computed: boolean
          health_tags: string[]
          interest_tags: string[]
          marital_status_computed: string
          name: string
          occupation_computed: string
          persona_id: string
          profile_image_url: string
          state_region_computed: string
          work_role_tags: string[]
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "researcher" | "user"
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
    Enums: {
      app_role: ["admin", "researcher", "user"],
    },
  },
} as const
