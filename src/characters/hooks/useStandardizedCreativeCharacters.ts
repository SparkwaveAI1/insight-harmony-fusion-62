
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CharacterCardData } from '../types/cardTypes';

interface UseStandardizedCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  enableSearch?: boolean;
}

interface StandardizedCharactersResult {
  characters: CharacterCardData[];
  totalCount: number;
}

export const useStandardizedCreativeCharacters = (
  options: UseStandardizedCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  const { limit = 12, offset = 0, searchQuery = '', enableSearch = true } = options;
  
  return useQuery({
    queryKey: ['standardized-creative-characters', user?.id, limit, offset, searchQuery],
    queryFn: async (): Promise<StandardizedCharactersResult> => {
      console.log('🚀 Standardized Character Lab fetch - Limit:', limit, 'Offset:', offset, 'Search:', searchQuery);
      
      try {
        // Build optimized query selecting only card-essential fields
        let query = supabase
          .from('characters')
          .select(`
            character_id,
            name,
            user_id,
            is_public,
            profile_image_url,
            created_at,
            trait_profile
          `, { count: 'exact' })
          .eq('creation_source', 'creative');

        // Apply user/public filter
        if (user) {
          query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
        } else {
          query = query.eq('is_public', true);
        }

        // Apply search filter
        if (enableSearch && searchQuery.trim()) {
          const searchTerm = searchQuery.trim();
          if (searchTerm.length <= 50) {
            query = query.or(`
              name.ilike.%${searchTerm}%,
              trait_profile->>description.ilike.%${searchTerm}%,
              trait_profile->>narrative_domain.ilike.%${searchTerm}%
            `);
          }
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('❌ Standardized query error:', error);
          throw error;
        }

        console.log(`✅ Standardized fetch complete: ${data?.length || 0} characters (${count} total)`);
        
        // Transform to standardized CharacterCardData objects
        const characters: CharacterCardData[] = (data || []).map(row => {
          const traitProfile = row.trait_profile as any || {};
          
          return {
            character_id: row.character_id,
            name: row.name,
            user_id: row.user_id,
            is_public: row.is_public || false,
            profile_image_url: row.profile_image_url,
            created_at: row.created_at,
            description: traitProfile.description || traitProfile.background_story || 'A creative character from Character Lab',
            narrative_domain: traitProfile.narrative_domain,
            functional_role: traitProfile.functional_role,
            entity_type: traitProfile.entity_type || 'human'
          };
        });

        return {
          characters,
          totalCount: count || 0
        };
      } catch (error) {
        console.error('❌ Error in standardized character fetch:', error);
        throw error;
      }
    },
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 500,
  });
};
