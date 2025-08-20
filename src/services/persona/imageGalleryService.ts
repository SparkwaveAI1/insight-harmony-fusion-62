
import { supabase } from '@/integrations/supabase/client';

export interface PersonaImage {
  id: string;
  persona_id: string;
  original_url?: string;
  storage_url: string;
  file_path: string;
  generation_prompt?: string;
  created_at: string;
  is_current: boolean;
}

export async function getPersonaImages(personaId: string): Promise<PersonaImage[]> {
  try {
    console.log('Fetching images for persona:', personaId);
    
    const { data, error } = await supabase
      .from('persona_images')
      .select('*')
      .eq('persona_id', personaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching persona images:', error);
      throw error;
    }

    console.log('Found persona images:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getPersonaImages:', error);
    throw error;
  }
}

export async function savePersonaImageToGallery(
  personaId: string,
  imageUrl: string,
  generationPrompt?: string
): Promise<PersonaImage | null> {
  try {
    console.log('Saving persona image to gallery:', { personaId, imageUrl });
    
    // Copy image to persona-images bucket using the existing upload service
    const { uploadPersonaImageFromUrl } = await import('@/services/supabase/storage/imageUploadService');
    const storageUrl = await uploadPersonaImageFromUrl(personaId, imageUrl);
    
    if (!storageUrl) {
      console.error('Failed to copy image to persona-images bucket');
      throw new Error('Failed to copy image to gallery bucket');
    }
    
    // Generate filename from storage URL
    const fileName = storageUrl.split('/').pop() || `${personaId}_${Date.now()}.png`;
    
    const { data, error } = await supabase
      .from('persona_images')
      .insert({
        persona_id: personaId,
        storage_url: storageUrl,
        file_path: fileName,
        original_url: imageUrl,
        generation_prompt: generationPrompt || '',
        is_current: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving persona image:', error);
      throw error;
    }

    console.log('Saved persona image:', data);
    return data;
  } catch (error) {
    console.error('Error in savePersonaImageToGallery:', error);
    throw error;
  }
}
