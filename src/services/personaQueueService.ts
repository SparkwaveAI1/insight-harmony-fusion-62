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
  console.log('getQueueItems called');
  
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
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

export const parsePersonaDescription = (text: string) => {
  const trimmedText = text.trim();
  
  // Extract name from first line (remove ** markdown)
  const lines = trimmedText.split('\n');
  const firstLine = lines[0] || '';
  const name = firstLine.replace(/\*\*/g, '').trim() || 'Unnamed Persona';
  
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