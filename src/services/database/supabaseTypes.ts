
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          email: string
          screener_data: Json
          screener_passed: boolean
          interview_unlocked: boolean
          unlock_code: string | null
          interview_completed: boolean
          transcript_url: string | null
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          screener_data?: Json
          screener_passed?: boolean
          interview_unlocked?: boolean
          unlock_code?: string | null
          interview_completed?: boolean
          transcript_url?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          screener_data?: Json
          screener_passed?: boolean
          interview_unlocked?: boolean
          unlock_code?: string | null
          interview_completed?: boolean
          transcript_url?: string | null
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questionnaires: {
        Row: {
          id: string
          participant_id: string
          responses: Json
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          responses?: Json
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          responses?: Json
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          participant_id: string
          start_time: string | null
          end_time: string | null
          duration_seconds: number | null
          status: "pending" | "in_progress" | "completed" | "failed"
          transcript: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          start_time?: string | null
          end_time?: string | null
          duration_seconds?: number | null
          status?: "pending" | "in_progress" | "completed" | "failed"
          transcript?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          start_time?: string | null
          end_time?: string | null
          duration_seconds?: number | null
          status?: "pending" | "in_progress" | "completed" | "failed"
          transcript?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unlock_code: {
        Args: {
          p_email: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
