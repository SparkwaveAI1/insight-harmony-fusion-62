
import { supabase } from '@/integrations/supabase/client';

export interface StructuredStudySession {
  id: string;
  user_id: string;
  title?: string;
  status: 'draft' | 'completed' | 'launched';
  current_step: number;
  study_goal?: any;
  research_format?: any;
  audience_definition?: any;
  output_goals?: any;
  created_at: string;
  updated_at: string;
}

export const structuredStudyService = {
  async createSession(data: {
    title?: string;
    current_step?: number;
    study_goal?: any;
    research_format?: any;
    audience_definition?: any;
    output_goals?: any;
  }): Promise<StructuredStudySession | null> {
    console.log('Creating structured study session:', data);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data: session, error } = await supabase
      .from('structured_study_sessions')
      .insert({
        ...data,
        user_id: user.id,
        current_step: data.current_step || 1,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating structured study session:', error);
      return null;
    }

    return session as StructuredStudySession;
  },

  async updateSession(sessionId: string, updates: {
    title?: string;
    current_step?: number;
    study_goal?: any;
    research_format?: any;
    audience_definition?: any;
    output_goals?: any;
    status?: 'draft' | 'completed' | 'launched';
  }): Promise<StructuredStudySession | null> {
    console.log('Updating structured study session:', sessionId, updates);
    
    const { data: session, error } = await supabase
      .from('structured_study_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating structured study session:', error);
      return null;
    }

    return session as StructuredStudySession;
  },

  async getSession(sessionId: string): Promise<StructuredStudySession | null> {
    console.log('Getting structured study session:', sessionId);
    
    const { data: session, error } = await supabase
      .from('structured_study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error getting structured study session:', error);
      return null;
    }

    return session as StructuredStudySession;
  },

  async getUserSessions(): Promise<StructuredStudySession[]> {
    console.log('Getting user structured study sessions');
    
    const { data: sessions, error } = await supabase
      .from('structured_study_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error getting user structured study sessions:', error);
      return [];
    }

    return (sessions || []) as StructuredStudySession[];
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    console.log('Deleting structured study session:', sessionId);
    
    const { error } = await supabase
      .from('structured_study_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting structured study session:', error);
      return false;
    }

    return true;
  }
};
