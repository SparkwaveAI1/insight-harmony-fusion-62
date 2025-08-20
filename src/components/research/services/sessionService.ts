
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPersonaById } from '@/services/persona';
import { DbPersona } from '@/services/persona';
import { getProjectDocuments, KnowledgeBaseDocument } from '@/services/collections';

interface SessionCreationResult {
  success: boolean;
  sessionId?: string;
  selectedPersonas?: DbPersona[];
  projectDocuments?: KnowledgeBaseDocument[];
  error?: string;
}

export const createResearchSession = async (
  personaIds: string[],
  projectId?: string
): Promise<SessionCreationResult> => {
  try {
    console.log('Creating research session with personas:', personaIds);
    console.log('Project ID:', projectId);
    
    if (personaIds.length === 0) {
      toast.error('Please select at least one persona');
      return { success: false, error: 'No personas selected' };
    }

    if (personaIds.length > 4) {
      toast.error('Maximum 4 personas allowed per session');
      return { success: false, error: 'Too many personas selected' };
    }

    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create a research session');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Load all selected personas
    const selectedPersonas: DbPersona[] = [];
    for (const personaId of personaIds) {
      try {
        console.log(`Loading V2 persona with ID: ${personaId}`);
        const persona = await getPersonaById(personaId);
        if (persona) {
          selectedPersonas.push(persona);
          console.log(`Successfully loaded V2 persona: ${persona.name}`);
        } else {
          console.warn(`V2 Persona not found: ${personaId}`);
        }
      } catch (error) {
        console.error(`Error loading V2 persona ${personaId}:`, error);
      }
    }

    if (selectedPersonas.length === 0) {
      toast.error('Failed to load any selected personas');
      return { success: false, error: 'Failed to load personas' };
    }

    console.log(`Successfully loaded ${selectedPersonas.length} personas`);

    // Load project knowledge base documents if project ID is provided
    let projectDocuments: KnowledgeBaseDocument[] = [];
    if (projectId) {
      try {
        projectDocuments = await getProjectDocuments(projectId);
        console.log(`Loaded ${projectDocuments.length} knowledge base documents for project`);
      } catch (error) {
        console.error('Error loading project documents:', error);
        // Don't fail the session creation if documents can't be loaded
      }
    }
    
    // Create the conversation session
    const { data, error } = await supabase
      .from('conversations')
      .insert({ 
        user_id: user.id,
        title: `Research Session - ${new Date().toLocaleDateString()}`,
        session_type: 'research',
        persona_ids: personaIds,
        active_persona_ids: personaIds,
        project_id: projectId || null,
        tags: ['research', 'multi-persona']
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create research session');
      return { success: false, error: error.message };
    }
    
    console.log('Research session created successfully:', data.id);
    toast.success(`Research session started with ${selectedPersonas.length} personas`);
    
    return { 
      success: true, 
      sessionId: data.id, 
      selectedPersonas,
      projectDocuments
    };
  } catch (error) {
    console.error('Error in createResearchSession:', error);
    toast.error('Failed to create research session');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
