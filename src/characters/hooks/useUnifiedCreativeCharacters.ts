
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter } from '../types/creativeCharacterTypes';
import { useAuth } from '@/context/AuthContext';

export const useUnifiedCreativeCharacters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unified-creative-characters', user?.id],
    queryFn: async (): Promise<CreativeCharacter[]> => {
      if (!user) {
        // If not authenticated, only fetch public characters
        const { data: publicData, error: publicError } = await supabase
          .from('characters')
          .select('*')
          .eq('creation_source', 'creative')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (publicError) throw publicError;
        return (publicData || []).map(item => ({
          ...item,
          trait_profile: item.trait_profile as any,
          metadata: item.metadata as any,
          behavioral_modulation: item.behavioral_modulation as any,
          linguistic_profile: item.linguistic_profile as any
          // NO emotional_triggers mapping - Character Lab doesn't use them
        })) as CreativeCharacter[];
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

      const userCharacters = (userResult.data || []).map(item => ({
        ...item,
        trait_profile: item.trait_profile as any,
        metadata: item.metadata as any,
        behavioral_modulation: item.behavioral_modulation as any,
        linguistic_profile: item.linguistic_profile as any
        // NO emotional_triggers mapping
      })) as CreativeCharacter[];
      
      const publicCharacters = (publicResult.data || []).map(item => ({
        ...item,
        trait_profile: item.trait_profile as any,
        metadata: item.metadata as any,
        behavioral_modulation: item.behavioral_modulation as any,
        linguistic_profile: item.linguistic_profile as any
        // NO emotional_triggers mapping
      })) as CreativeCharacter[];

      // Combine and sort by creation date
      const allCharacters = [...userCharacters, ...publicCharacters];
      return allCharacters.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: true
  });
};
