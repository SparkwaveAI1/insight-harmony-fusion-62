import { supabase } from '@/integrations/supabase/client';

export async function addToQueue(
  userId: string, 
  name: string, 
  description: string, 
  collections?: string[]
) {
  console.log('addToQueue called');
  
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .insert({
      user_id: userId,
      name,
      description,
      collections,
      status: 'pending',
      attempt_count: 0
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Atomically pop the next queue item and mark it as processing
export async function popNextQueueItem() {
  console.log('popNextQueueItem called');
  
  const { data, error } = await supabase.rpc('pop_next_persona_queue');
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getQueueItems(userId: string) {
  // Select only columns needed for display (exclude large 'description' field)
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .select('id, user_id, name, status, persona_id, error_message, collections, attempt_count, processing_started_at, created_at, updated_at, completed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data;
}

// Admin function to get ALL queue items across all users (with pagination)
export async function getAllQueueItems(limit: number = 50, offset: number = 0) {
  console.log('getAllQueueItems: calling RPC with limit=', limit, 'offset=', offset);

  try {
    const { data, error } = await supabase.rpc('get_all_queue_items', {
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('getAllQueueItems: RPC error:', error);
      throw error;
    }

    console.log('getAllQueueItems: returned', data?.length || 0, 'items');
    return data || [];
  } catch (err: any) {
    console.error('getAllQueueItems: Exception:', err);
    throw err;
  }
}

// Get total count of queue items for pagination
export async function getQueueItemCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_queue_item_count');

    if (error) {
      console.error('getQueueItemCount: RPC error:', error);
      return 0;
    }

    return data || 0;
  } catch (err) {
    console.error('getQueueItemCount: Exception:', err);
    return 0;
  }
}

export const updateQueueStatus = async (
  id: string, 
  status: string, 
  personaId?: string, 
  errorMessage?: string
) => {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  // Add persona_id if provided
  if (personaId) {
    updateData.persona_id = personaId;
  }
  
  // Add error message if provided
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }
  
  // Set completed_at timestamp for completed status
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  return data;
};

// Helper function to safely update queue status with error handling
export const updateQueueStatusSafe = async (
  id: string, 
  status: string, 
  personaId?: string, 
  errorMessage?: string
) => {
  try {
    return await updateQueueStatus(id, status, personaId, errorMessage);
  } catch (error) {
    console.error('Failed to update queue status', { id, status, personaId, error });
    throw error;
  }
};

// Force fail a specific queue item by ID
export const forceFailQueueItem = async (id: string, reason: string = 'Manually failed') => {
  try {
    return await updateQueueStatus(id, 'failed', undefined, reason);
  } catch (error) {
    console.error('Failed to force fail queue item', { id, reason, error });
    throw error;
  }
};

// Delete a queue item completely from the database
export const deleteQueueItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('persona_creation_queue')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete queue item', { id, error });
    throw error;
  }
};

export const parsePersonaDescription = (text: string) => {
  const trimmedText = text.trim();
  
  // Extract name from first line
  const lines = trimmedText.split('\n');
  const firstLine = lines[0] || '';
  
  // Remove leading numbers and dots (e.g., "6. Caleb Whitaker" → "Caleb Whitaker")
  // Remove ** markdown formatting
  let name = firstLine
    .replace(/^\d+\.\s*/, '')  // Remove "6. " prefix
    .replace(/\*\*/g, '')       // Remove ** markdown
    .trim();
  
  // Fallback if name is empty
  if (!name) {
    name = 'Unnamed Persona';
  }
  
  // Extract collections if they exist
  const collectionsMatch = trimmedText.match(/(?:\*\*)?Collections:(?:\*\*)?\s*(.+?)(?:\n|$)/i);
  const collections = collectionsMatch 
    ? collectionsMatch[1].split(',').map(c => c.trim()).filter(c => c.length > 0)
    : [];
  
  return {
    name,
    description: trimmedText,
    collections
  };
};

// Parse bulk persona descriptions (multiple entries)
export const parseBulkPersonaDescriptions = (text: string) => {
  // Normalize line endings (Windows \r\n and old Mac \r to Unix \n) before processing
  const trimmedText = text.replace(/\r\n?/g, '\n').trim();

  // Method 1: Split by "---" separator (3+ dashes on their own line)
  const dashChunks = trimmedText
    .split(/^-{3,}$/m)
    .map(c => c.trim())
    .filter(c => c.length > 50);

  if (dashChunks.length > 1) {
    console.log(`parseBulkPersonaDescriptions: Found ${dashChunks.length} personas using --- separator`);
    return dashChunks.map(chunk => parsePersonaDescription(chunk));
  }

  // Method 2: Split by bold numbered entries (e.g., "**71. Name**")
  const boldNumberedChunks = trimmedText.split(/\n(?=\*\*\d+\.\s+[A-Z])/);

  if (boldNumberedChunks.length > 1) {
    const personas = boldNumberedChunks
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0)
      .map(chunk => parsePersonaDescription(chunk));
    console.log(`parseBulkPersonaDescriptions: Found ${personas.length} personas using **N. format`);
    return personas;
  }

  // Method 3: Split by plain numbered entries (e.g., "71. Name")
  const numberedChunks = trimmedText.split(/\n(?=\d+\.\s+[A-Z])/);

  if (numberedChunks.length > 1) {
    const personas = numberedChunks
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0)
      .map(chunk => parsePersonaDescription(chunk));
    console.log(`parseBulkPersonaDescriptions: Found ${personas.length} personas using N. format`);
    return personas;
  }

  // Fallback: treat as single persona
  console.log('parseBulkPersonaDescriptions: No separators found, treating as single persona');
  return [parsePersonaDescription(trimmedText)];
};