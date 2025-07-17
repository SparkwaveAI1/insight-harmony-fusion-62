
import { supabase } from '@/integrations/supabase/client';
import { PersonaUpdateData } from '../types';

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

export const updatePersonaProfileImageUrl = async (personaId: string, imageUrl: string): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .update({ profile_image_url: imageUrl })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating persona profile image:', error);
    throw error;
  }
};

export const updatePersona = async (personaId: string, updates: PersonaUpdateData): Promise<void> => {
  const { error } = await supabase
    .from('personas')
    .update(updates)
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating persona:', error);
    throw error;
  }
};
