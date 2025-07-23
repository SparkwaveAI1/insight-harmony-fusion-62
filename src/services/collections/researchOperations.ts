import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ResearchSurveySession {
  id: string;
  research_survey_id: string;
  conversation_id: string | null;
  selected_personas: string[];
  status: string;
  started_at: string | null;
  completed_at: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  research_context: any;
  // Joined data from research_surveys table
  survey_name?: string;
  survey_description?: string;
  survey_questions?: any[];
  // Related project data
  project_id?: string;
}

export interface ResearchReport {
  id: string;
  survey_session_id: string;
  user_id: string;
  insights: any;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all research survey sessions for a specific project
 */
export const getProjectResearchSessions = async (projectId: string): Promise<ResearchSurveySession[]> => {
  try {
    const { data, error } = await supabase
      .from("research_survey_sessions")
      .select(`
        *,
        research_surveys!inner(
          name,
          description,
          questions,
          project_id
        )
      `)
      .eq("research_surveys.project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    // Transform the data to include survey details at the top level
    const sessions = (data || []).map(session => ({
      ...session,
      survey_name: session.research_surveys?.name,
      survey_description: session.research_surveys?.description,
      survey_questions: Array.isArray(session.research_surveys?.questions) 
        ? session.research_surveys.questions 
        : [],
      project_id: session.research_surveys?.project_id
    }));

    return sessions;
  } catch (error) {
    console.error("Error fetching project research sessions:", error);
    toast.error("Failed to fetch research sessions");
    return [];
  }
};

/**
 * Fetches a specific research survey session with related data
 */
export const getResearchSessionById = async (sessionId: string): Promise<ResearchSurveySession | null> => {
  try {
    const { data, error } = await supabase
      .from("research_survey_sessions")
      .select(`
        *,
        research_surveys(
          name,
          description,
          questions,
          project_id
        )
      `)
      .eq("id", sessionId)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    return {
      ...data,
      survey_name: data.research_surveys?.name,
      survey_description: data.research_surveys?.description,
      survey_questions: Array.isArray(data.research_surveys?.questions) 
        ? data.research_surveys.questions 
        : [],
      project_id: data.research_surveys?.project_id
    };
  } catch (error) {
    console.error("Error fetching research session:", error);
    toast.error("Failed to fetch research session");
    return null;
  }
};

/**
 * Fetches research report for a survey session
 */
export const getResearchReport = async (sessionId: string): Promise<ResearchReport | null> => {
  try {
    const { data, error } = await supabase
      .from("research_reports")
      .select("*")
      .eq("survey_session_id", sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found" error
    
    return data || null;
  } catch (error) {
    console.error("Error fetching research report:", error);
    return null;
  }
};