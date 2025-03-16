
import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabaseTypes";

// Initialize the Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Participant operations
export const participantOperations = {
  // Create a new participant with screener data
  createParticipant: async (email: string, screenerData: any) => {
    const { data, error } = await supabase
      .from("participants")
      .insert([
        {
          email,
          screener_data: screenerData,
          screener_passed: true,
          interview_unlocked: false,
          interview_completed: false,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get participant by email
  getParticipantByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Check if a participant's interview is unlocked
  checkInterviewUnlocked: async (participantId: string) => {
    const { data, error } = await supabase
      .from("participants")
      .select("interview_unlocked")
      .eq("id", participantId)
      .single();

    if (error) throw error;
    return data?.interview_unlocked || false;
  },

  // Validate unlock code
  validateUnlockCode: async (email: string, code: string) => {
    const { data, error } = await supabase
      .from("participants")
      .select("id, unlock_code")
      .eq("email", email)
      .eq("unlock_code", code)
      .single();

    if (error) return false;
    return !!data;
  },
};

// Questionnaire operations
export const questionnaireOperations = {
  // Save questionnaire responses
  saveResponses: async (participantId: string, responses: any) => {
    const { data, error } = await supabase
      .from("questionnaires")
      .insert([
        {
          participant_id: participantId,
          responses,
          completed: true,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get questionnaire by participant
  getByParticipantId: async (participantId: string) => {
    const { data, error } = await supabase
      .from("questionnaires")
      .select("*")
      .eq("participant_id", participantId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },
};

// Interview operations
export const interviewOperations = {
  // Create a new interview session
  createInterview: async (participantId: string) => {
    const { data, error } = await supabase
      .from("interviews")
      .insert([
        {
          participant_id: participantId,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Start an interview
  startInterview: async (interviewId: string) => {
    const startTime = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("interviews")
      .update({
        start_time: startTime,
        status: "in_progress",
      })
      .eq("id", interviewId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Complete an interview
  completeInterview: async (interviewId: string, transcript: string) => {
    const endTime = new Date().toISOString();
    
    const { data: interview } = await supabase
      .from("interviews")
      .select("start_time")
      .eq("id", interviewId)
      .single();
    
    let durationSeconds = 0;
    if (interview?.start_time) {
      const startTime = new Date(interview.start_time);
      const end = new Date(endTime);
      durationSeconds = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    }
    
    const { data, error } = await supabase
      .from("interviews")
      .update({
        end_time: endTime,
        duration_seconds: durationSeconds,
        status: "completed",
        transcript,
      })
      .eq("id", interviewId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  // Get interview by ID
  getInterview: async (interviewId: string) => {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", interviewId)
      .single();

    if (error) throw error;
    return data;
  },
};
