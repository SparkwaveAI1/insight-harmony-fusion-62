import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectQuestionSet {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  description?: string;
  questions: string[];
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const saveQuestionSet = async (
  projectId: string,
  name: string,
  questions: string[],
  description?: string,
  tags: string[] = []
): Promise<ProjectQuestionSet | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Authentication required');
      return null;
    }

    const { data, error } = await supabase
      .from('project_question_sets')
      .insert({
        project_id: projectId,
        user_id: user.id,
        name,
        description,
        questions,
        tags,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving question set:', error);
      toast.error('Failed to save question set');
      return null;
    }

    toast.success('Question set saved successfully');
    return {
      ...data,
      questions: Array.isArray(data.questions) ? data.questions.map(q => String(q)) : []
    };
  } catch (error) {
    console.error('Error saving question set:', error);
    toast.error('Failed to save question set');
    return null;
  }
};

export const getProjectQuestionSets = async (projectId: string): Promise<ProjectQuestionSet[]> => {
  try {
    const { data, error } = await supabase
      .from('project_question_sets')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching question sets:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      questions: Array.isArray(item.questions) ? item.questions.map(q => String(q)) : []
    }));
  } catch (error) {
    console.error('Error fetching question sets:', error);
    return [];
  }
};

export const deleteQuestionSet = async (questionSetId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_question_sets')
      .update({ status: 'deleted' })
      .eq('id', questionSetId);

    if (error) {
      console.error('Error deleting question set:', error);
      toast.error('Failed to delete question set');
      return false;
    }

    toast.success('Question set deleted');
    return true;
  } catch (error) {
    console.error('Error deleting question set:', error);
    toast.error('Failed to delete question set');
    return false;
  }
};