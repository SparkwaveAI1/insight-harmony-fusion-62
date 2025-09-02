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

export async function updateQueueStatus(id: string, status: string) {
  console.log('updateQueueStatus called');
  
  const { data, error } = await supabase
    .from('persona_creation_queue')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}