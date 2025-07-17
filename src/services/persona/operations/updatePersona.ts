
import { supabase } from '@/integrations/supabase/client';

export const updatePersonaName = async (personaId: string, name: string): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .update({ name })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating persona name:', error);
    throw error;
  }
};

export const updatePersonaDescription = async (personaId: string, description: string): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .update({ description })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating persona description:', error);
    throw error;
  }
};

export const updatePersonaVisibility = async (personaId: string, isPublic: boolean): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .update({ is_public: isPublic })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating persona visibility:', error);
    throw error;
  }
};
