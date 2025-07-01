
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { dbCharacterToCharacter } from '../services/characterMappers';

export const useCreativeCharacters = () => {
  return useQuery({
    queryKey: ['creative-characters'],
    queryFn: async (): Promise<Character[]> => {
      console.log('Fetching creative characters...');
      
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('creation_source', 'creative')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching creative characters:', error);
        throw error;
      }

      console.log('✅ Creative characters fetched:', data?.length || 0);
      return data ? data.map(dbCharacterToCharacter) : [];
    },
  });
};
