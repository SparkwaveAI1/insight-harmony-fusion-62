
import { supabase } from '@/integrations/supabase/client';

export const deletePersona = async (personaId: string): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error deleting persona:', error);
    throw error;
  }
};
