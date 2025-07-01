
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { useAuth } from '@/context/AuthContext';

export const useUnifiedCreativeCharacters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unified-creative-characters', user?.id],
    queryFn: async (): Promise<Character[]> => {
      if (!user) {
        // If not authenticated, only fetch public characters
        const { data: publicData, error: publicError } = await supabase
          .from('characters')
          .select('*')
          .eq('creation_source', 'creative')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (publicError) throw publicError;
        return (publicData || []) as Character[];
      }

      // If authenticated, fetch both user's characters and public characters
      const [userResult, publicResult] = await Promise.all([
        supabase
          .from('characters')
          .select('*')
          .eq('creation_source', 'creative')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('characters')
          .select('*')
          .eq('creation_source', 'creative')
          .eq('is_public', true)
          .neq('user_id', user.id) // Exclude user's own public characters to avoid duplicates
          .order('created_at', { ascending: false })
      ]);

      if (userResult.error) throw userResult.error;
      if (publicResult.error) throw publicResult.error;

      const userCharacters = (userResult.data || []) as Character[];
      const publicCharacters = (publicResult.data || []) as Character[];

      // Combine and sort by creation date
      const allCharacters = [...userCharacters, ...publicCharacters];
      return allCharacters.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: true
  });
};
