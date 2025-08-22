import { supabase } from '@/integrations/supabase/client';

export interface ResearchSessionStatus {
  id: string;
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  created_at: string;
  survey_name?: string;
  progress?: {
    total_questions: number;
    completed_responses: number;
    total_expected_responses: number;
  };
}

export async function getActiveResearchSessions(): Promise<ResearchSessionStatus[]> {
  const { data, error } = await supabase
    .from('research_survey_sessions')
    .select(`
      id,
      status,
      started_at,
      completed_at,
      created_at,
      selected_personas,
      research_surveys(name, questions)
    `)
    .in('status', ['active', 'in_progress', 'pending'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }

  // Calculate progress for each session
  const sessionsWithProgress = await Promise.all(
    data.map(async (session) => {
      const questions = Array.isArray(session.research_surveys?.questions) ? session.research_surveys.questions : [];
      const personas = Array.isArray(session.selected_personas) ? session.selected_personas : [];
      const total_expected_responses = questions.length * personas.length;

      // Count completed responses
      const { count: completed_responses } = await supabase
        .from('research_survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      return {
        id: session.id,
        status: session.status as ResearchSessionStatus['status'],
        started_at: session.started_at,
        completed_at: session.completed_at,
        created_at: session.created_at,
        survey_name: session.research_surveys?.name,
        progress: {
          total_questions: questions.length,
          completed_responses: completed_responses || 0,
          total_expected_responses
        }
      };
    })
  );

  return sessionsWithProgress;
}

export async function resumeResearchSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('research-session-orchestrator', {
      body: {
        session_id: sessionId,
        action: 'resume'
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, message: 'Research session resumed successfully' };
  } catch (error) {
    console.error('Error resuming research session:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to resume session' 
    };
  }
}

export async function startResearchSessionOrchestration(sessionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('research-session-orchestrator', {
      body: {
        session_id: sessionId,
        action: 'start'
      }
    });

    if (error) {
      throw error;
    }

    return { success: true, message: 'Research session started in background' };
  } catch (error) {
    console.error('Error starting research session orchestration:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to start session' 
    };
  }
}

export async function getResearchSessionStatus(sessionId: string): Promise<ResearchSessionStatus | null> {
  try {
    const { data, error } = await supabase.functions.invoke('research-session-orchestrator', {
      body: {
        session_id: sessionId,
        action: 'status'
      }
    });

    if (error || !data?.session) {
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error getting session status:', error);
    return null;
  }
}