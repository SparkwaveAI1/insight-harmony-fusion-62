
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CharacterMemory, CreateMemoryData } from './types/memoryTypes';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Upload a memory to the character knowledge base
 */
export const createCharacterMemory = async (
  memoryData: CreateMemoryData
): Promise<CharacterMemory | null> => {
  try {
    console.log('Creating character memory:', memoryData.character_id);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create memories");
      return null;
    }

    // Check file size if a file is provided
    if (memoryData.file && memoryData.file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (memoryData.file.size / (1024 * 1024)).toFixed(2);
      toast.error(`File size (${fileSizeMB}MB) exceeds the 5MB limit`);
      return null;
    }

    let fileUrl = null;
    let fileType = null;
    let fileSize = null;

    // If a file is provided, upload it to storage
    if (memoryData.file) {
      console.log('Uploading memory file:', memoryData.file.name);
      
      const fileName = `${user.id}/${memoryData.character_id}/${Date.now()}-${memoryData.file.name}`;
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('character-memories')
        .upload(fileName, memoryData.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('character-memories')
        .getPublicUrl(fileName);

      fileUrl = publicUrl;
      fileType = memoryData.file.type;
      fileSize = memoryData.file.size;
    }

    // Insert the memory record
    const { data, error } = await supabase
      .from('character_memories')
      .insert({
        character_id: memoryData.character_id,
        title: memoryData.title,
        content: memoryData.content,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        memory_type: memoryData.memory_type || 'note',
        tags: memoryData.tags || [],
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    toast.success('Memory created successfully');
    return data as CharacterMemory;
  } catch (error) {
    console.error('Error creating memory:', error);
    toast.error(`Failed to create memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

/**
 * Get all memories for a character
 */
export const getCharacterMemories = async (characterId: string): Promise<CharacterMemory[]> => {
  try {
    console.log('Fetching memories for character:', characterId);
    
    const { data, error } = await supabase
      .from('character_memories')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
      throw error;
    }
    
    return data as CharacterMemory[] || [];
  } catch (error) {
    console.error('Error fetching character memories:', error);
    toast.error('Failed to fetch memories');
    return [];
  }
};

/**
 * Delete a memory from the character knowledge base
 */
export const deleteCharacterMemory = async (memoryId: string): Promise<boolean> => {
  try {
    console.log('Deleting memory:', memoryId);
    
    // First get the memory to check if it has a file
    const { data: memory } = await supabase
      .from('character_memories')
      .select('file_url')
      .eq('id', memoryId)
      .single();

    // Delete the file from storage if it exists
    if (memory?.file_url) {
      try {
        const url = new URL(memory.file_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(-3).join('/');
        
        const { error: storageError } = await supabase.storage
          .from('character-memories')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      } catch (storageError) {
        console.error('Error parsing file URL:', storageError);
      }
    }

    // Delete the database record
    const { error } = await supabase
      .from('character_memories')
      .delete()
      .eq('id', memoryId);

    if (error) {
      console.error('Database delete error:', error);
      throw error;
    }
    
    toast.success('Memory deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting memory:', error);
    toast.error('Failed to delete memory');
    return false;
  }
};

/**
 * Update a memory
 */
export const updateCharacterMemory = async (
  memoryId: string,
  updates: Partial<Pick<CharacterMemory, 'title' | 'content' | 'memory_type' | 'tags'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('character_memories')
      .update(updates)
      .eq('id', memoryId);

    if (error) {
      console.error('Error updating memory:', error);
      throw error;
    }

    toast.success('Memory updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating memory:', error);
    toast.error('Failed to update memory');
    return false;
  }
};
