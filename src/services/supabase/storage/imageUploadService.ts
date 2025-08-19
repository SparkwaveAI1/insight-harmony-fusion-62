import { supabase } from '@/integrations/supabase/client';

export const uploadPersonaImageFromUrl = async (
  url: string,
  personaId: string,
  filename?: string
): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image from URL');
    }
    
    const blob = await response.blob();
    const fileExtension = url.split('.').pop() || 'jpg';
    const fileName = filename || `${personaId}-${Date.now()}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
      .from('persona-images')
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('persona-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPersonaImageFromUrl:', error);
    return null;
  }
};

export const savePersonaProfileImage = async (
  file: File,
  personaId: string
): Promise<string | null> => {
  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${personaId}-${Date.now()}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
      .from('persona-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('persona-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in savePersonaProfileImage:', error);
    return null;
  }
};