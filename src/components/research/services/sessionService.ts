
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { getAllPersonas } from '@/services/persona';

export const createResearchSession = async (personaIds: string[]): Promise<{
  success: boolean;
  sessionId?: string;
  selectedPersonas?: Persona[];
}> => {
  try {
    console.log('Creating session with personas:', personaIds);
    
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to start a research session');
      return { success: false };
    }

    // Fetch fresh personas to ensure we have the latest data
    const allPersonas = await getAllPersonas();
    const selectedPersonas = allPersonas.filter(p => 
      personaIds.includes(p.persona_id)
    );
    
    console.log('Selected personas:', selectedPersonas);
    
    if (selectedPersonas.length === 0) {
      toast.error('No valid personas selected');
      return { success: false };
    }

    // First, create or get a default research project
    let projectId: string;
    
    // Try to find an existing research project for this user
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Research Sessions')
      .limit(1);

    if (existingProjects && existingProjects.length > 0) {
      projectId = existingProjects[0].id;
    } else {
      // Create a new research project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: 'Research Sessions',
          description: 'Default project for research sessions',
          user_id: user.id
        })
        .select('id')
        .single();

      if (projectError) throw projectError;
      projectId = newProject.id;
    }

    // Create research conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        title: `Research Session - ${new Date().toLocaleDateString()}`,
        session_type: 'research',
        active_persona_ids: personaIds,
        auto_mode: false,
        persona_ids: personaIds,
        project_id: projectId,
        user_id: user.id,
        tags: ['research']
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Session created successfully:', conversation.id);
    toast.success('Research session started successfully');
    
    return {
      success: true,
      sessionId: conversation.id,
      selectedPersonas
    };
  } catch (error) {
    console.error('Error creating research session:', error);
    toast.error('Failed to start research session');
    return { success: false };
  }
};
