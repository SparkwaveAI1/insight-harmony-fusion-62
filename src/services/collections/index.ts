
import { supabase } from '@/integrations/supabase/client';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const getUserCollections = async (): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }

  return data || [];
};

export const getCollectionById = async (id: string): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }

  return data;
};

export const createCollection = async (name: string, description?: string): Promise<Collection> => {
  const { data, error } = await supabase
    .from('collections')
    .insert({ name, description })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    throw error;
  }

  return data;
};

export const updateCollection = async (id: string, updates: { name?: string; description?: string }): Promise<void> => {
  const { error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

export const deleteCollection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};
