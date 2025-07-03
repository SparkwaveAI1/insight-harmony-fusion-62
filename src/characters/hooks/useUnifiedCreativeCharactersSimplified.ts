
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter } from '../types/creativeCharacterTypes';
import { dbResultToCreativeCharacter } from '../services/creativeCharacterTypeMappers';
import { useAuth } from '@/context/AuthContext';

export const useUnifiedCreativeCharactersSimplified = () => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['unified-creative-characters-simplified', user?.id],
    queryFn: async (): Promise<CreativeCharacter[]> => {
      console.log('Fetching creative characters for user:', user?.id);
      
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('creation_source', 'creative')
          .or(`user_id.eq.${user?.id || 'null'},is_public.eq.true`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database error fetching characters:', error);
          throw error;
        }

        console.log(`Successfully fetched ${data?.length || 0} characters`);
        return (data || []).map(dbResultToCreativeCharacter);
      } catch (error) {
        console.error('Error in character fetch:', error);
        throw error;
      }
    },
    enabled: !authLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
