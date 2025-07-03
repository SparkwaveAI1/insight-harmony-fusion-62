
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseHighPerformanceCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  enableSearch?: boolean;
}

// Lightweight character summary for initial load
interface CharacterSummary {
  character_id: string;
  name: string;
  creation_source: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  profile_image_url: string;
  description: string;
  entity_type: string;
  narrative_domain: string;
}

// Simplified character details type
interface CharacterDetails {
  character_id: string;
  name: string;
  character_type: 'fictional';
  creation_source: 'creative';
  creation_date: string;
  created_at: string;
  metadata: Record<string, any>;
  behavioral_modulation: Record<string, any>;
  interview_sections: any[];
  linguistic_profile: Record<string, any>;
  preinterview_tags: any[];
  simulation_directives: Record<string, any>;
  trait_profile: Record<string, any>;
  is_public: boolean;
  enhanced_metadata_version: number;
  user_id: string;
  profile_image_url: string | null;
}

// Explicit result type to avoid deep type inference
interface HighPerformanceCharactersResult {
  characters: CharacterSummary[];
  totalCount: number;
}

export const useHighPerformanceCreativeCharacters = (
  options: UseHighPerformanceCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  const { limit = 12, offset = 0, searchQuery = '', enableSearch = true } = options;
  
  return useQuery({
    queryKey: ['high-perf-creative-characters', user?.id, limit, offset, searchQuery],
    queryFn: async (): Promise<HighPerformanceCharactersResult> => {
      console.log('🚀 High-performance fetch - Limit:', limit, 'Offset:', offset, 'Search:', searchQuery);
      
      try {
        // Build optimized query selecting only essential fields
        let query = supabase
          .from('characters')
          .select(`
            character_id,
            name,
            creation_source,
            created_at,
            user_id,
            is_public,
            profile_image_url,
            trait_profile
          `, { count: 'exact' })
          .eq('creation_source', 'creative');

        // Apply user/public filter using our new optimized indexes
        if (user) {
          // Use OR condition that leverages our composite index
          query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
        } else {
          // Use public-only index for anonymous users
          query = query.eq('is_public', true);
        }

        // Apply search filter efficiently using GIN index
        if (enableSearch && searchQuery.trim()) {
          const searchTerm = searchQuery.trim();
          
          // Use ilike for name search (uses our name index)
          if (searchTerm.length <= 50) { // Reasonable search term length
            query = query.or(`
              name.ilike.%${searchTerm}%,
              trait_profile->>description.ilike.%${searchTerm}%,
              trait_profile->>narrative_domain.ilike.%${searchTerm}%
            `);
          }
        }

        // Apply pagination with our optimized indexes
        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('❌ High-performance query error:', error);
          throw error;
        }

        console.log(`✅ High-performance fetch complete: ${data?.length || 0} characters (${count} total)`);
        
        // Transform to CharacterSummary objects
        const characters: CharacterSummary[] = (data || []).map(row => {
          const traitProfile = row.trait_profile as any || {};
          
          return {
            character_id: row.character_id,
            name: row.name,
            creation_source: row.creation_source,
            created_at: row.created_at,
            user_id: row.user_id,
            is_public: row.is_public || false,
            profile_image_url: row.profile_image_url,
            description: traitProfile.description || '',
            entity_type: traitProfile.entity_type || 'human',
            narrative_domain: traitProfile.narrative_domain || 'modern'
          };
        });

        return {
          characters,
          totalCount: count || 0
        };
      } catch (error) {
        console.error('❌ Error in high-performance character fetch:', error);
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

// Hook for lazy loading full character details
export const useLazyCharacterDetails = (characterId: string | null, enabled = false) => {
  return useQuery({
    queryKey: ['character-details', characterId],
    queryFn: async (): Promise<CharacterDetails | null> => {
      if (!characterId) return null;
      
      console.log('🔍 Lazy loading character details:', characterId);
      
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('character_id', characterId)
        .eq('creation_source', 'creative')
        .single();

      if (error) {
        console.error('Error loading character details:', error);
        return null;
      }

      // Transform to CharacterDetails
      return {
        character_id: data.character_id,
        name: data.name,
        character_type: 'fictional' as const,
        creation_source: 'creative' as const,
        creation_date: data.created_at,
        created_at: data.created_at,
        metadata: data.metadata || {},
        behavioral_modulation: data.behavioral_modulation || {},
        interview_sections: data.interview_sections || [],
        linguistic_profile: data.linguistic_profile || {},
        preinterview_tags: data.preinterview_tags || [],
        simulation_directives: data.simulation_directives || {},
        trait_profile: data.trait_profile || {},
        is_public: data.is_public || false,
        enhanced_metadata_version: data.enhanced_metadata_version || 2,
        user_id: data.user_id,
        profile_image_url: data.profile_image_url
      } as CharacterDetails;
    },
    enabled: enabled && !!characterId,
    staleTime: 1000 * 60 * 10, // 10 minutes for detailed data
    retry: 1,
  });
};
