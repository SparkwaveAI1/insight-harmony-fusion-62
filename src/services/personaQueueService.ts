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
      status: 'pending'
    })
    .select()
    .single();

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

export const updateQueueStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .update({ status })  // Only update status, no updated_at
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  return data;
};

export const parsePersonaDescription = (text: string) => {
  const trimmedText = text.trim();
  
  // Extract name from first line (remove ** markdown)
  const lines = trimmedText.split('\n');
  const firstLine = lines[0] || '';
  const name = firstLine.replace(/\*\*/g, '').trim() || 'Unnamed Persona';
  
  // Extract collections if they exist
  const collectionsMatch = trimmedText.match(/\*\*Collections:\*\*\s*(.+?)(?:\n|$)/i);
  const collections = collectionsMatch 
    ? collectionsMatch[1].split(',').map(c => c.trim()).filter(c => c.length > 0)
    : [];
  
  return {
    name,
    description: trimmedText,
    collections
  };
};