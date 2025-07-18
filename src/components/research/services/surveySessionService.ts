
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SurveySession {
  id: string;
  research_survey_id: string;
  conversation_id: string | null;
  selected_personas: string[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const createSurveySession = async (
  surveyId: string,
  selectedPersonas: string[],
  conversationId?: string
): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      toast.error('Authentication required');
      return null;
    }

    console.log('Creating survey session for survey:', surveyId);
    
    const { data: session, error } = await supabase
      .from('research_survey_sessions')
      .insert({
        research_survey_id: surveyId,
        conversation_id: conversationId || null,
        selected_personas: selectedPersonas,
        status: 'pending',
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating survey session:', error);
      toast.error(`Failed to create survey session: ${error.message}`);
      return null;
    }

    console.log('Survey session created successfully:', session.id);
    return session.id;
  } catch (error) {
    console.error('Error creating survey session:', error);
    toast.error('Failed to create survey session');
    return null;
  }
};

export const updateSurveySessionStatus = async (
  sessionId: string,
  status: 'active' | 'completed' | 'cancelled',
  conversationId?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'active') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (conversationId) {
      updateData.conversation_id = conversationId;
    }

    const { error } = await supabase
      .from('research_survey_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating survey session status:', error);
      return false;
    }

    console.log('Survey session status updated:', sessionId, status);
    return true;
  } catch (error) {
    console.error('Error updating survey session status:', error);
    return false;
  }
};

export const getSurveySession = async (sessionId: string): Promise<SurveySession | null> => {
  try {
    const { data: session, error } = await supabase
      .from('research_survey_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching survey session:', error);
      return null;
    }

    // Type cast the status to ensure it matches our union type
    const typedSession: SurveySession = {
      ...session,
      status: session.status as 'pending' | 'active' | 'completed' | 'cancelled'
    };

    return typedSession;
  } catch (error) {
    console.error('Error fetching survey session:', error);
    return null;
  }
};
