
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter } from '../types/creativeCharacterTypes';
import { dbResultToCreativeCharacter } from '../services/creativeCharacterTypeMappers';
import { useAuth } from '@/context/AuthContext';

interface UseOptimizedCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

export const useOptimizedCreativeCharacters = (options: UseOptimizedCreativeCharactersOptions = {}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { limit = 20, offset = 0, searchQuery = '' } = options;
  
  return useQuery({
    queryKey: ['optimized-creative-characters', user?.id, limit, offset, searchQuery],
    queryFn: async (): Promise<{ characters: CreativeCharacter[], totalCount: number }> => {
      console.log('🚀 Optimized fetch - Limit:', limit, 'Offset:', offset, 'Search:', searchQuery);
      
      try {
        // Build the base query with optimized column selection
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
            trait_profile->description,
            trait_profile->narrative_domain,
            trait_profile->entity_type,
            trait_profile->primary_ability,
            trait_profile->core_purpose
          `, { count: 'exact' })
          .eq('creation_source', 'creative');

        // Apply user/public filter using the new indexes
        if (user) {
          query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
        } else {
          query = query.eq('is_public', true);
        }

        // Apply search filter if provided
        if (searchQuery.trim()) {
          const searchTerm = `%${searchQuery.toLowerCase()}%`;
          query = query.or(`
            name.ilike.${searchTerm},
            trait_profile->description.ilike.${searchTerm},
            trait_profile->narrative_domain.ilike.${searchTerm}
          `);
        }

        // Apply pagination and ordering (uses our new indexes)
        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('❌ Optimized query error:', error);
          throw error;
        }

        console.log(`✅ Optimized fetch complete: ${data?.length || 0} characters (${count} total)`);
        
        // Convert to full CreativeCharacter objects with minimal trait profiles
        const characters = (data || []).map(row => {
          // Create a minimal trait profile from selected columns
          const minimalTraitProfile = {
            description: row.trait_profile?.description || '',
            narrative_domain: row.trait_profile?.narrative_domain || 'modern',
            entity_type: row.trait_profile?.entity_type || 'human',
            primary_ability: row.trait_profile?.primary_ability || '',
            core_purpose: row.trait_profile?.core_purpose || '',
            // Set defaults for other required fields
            functional_role: 'protagonist_agent',
            environment: 'Contemporary setting',
            physical_form: 'Human form',
            communication_method: { modality: 'verbal', grammar: 'standard', expression_register: 'casual' },
            key_activities: [],
            important_knowledge: [],
            surface_triggers: [],
            change_response_style: 'mutate_adapt'
          };

          return {
            character_id: row.character_id,
            name: row.name,
            character_type: 'fictional' as const,
            creation_source: 'creative' as const,
            creation_date: row.created_at,
            created_at: row.created_at,
            metadata: {},
            behavioral_modulation: {},
            interview_sections: [],
            linguistic_profile: {},
            preinterview_tags: [],
            simulation_directives: {},
            trait_profile: minimalTraitProfile,
            is_public: row.is_public || false,
            enhanced_metadata_version: 2,
            user_id: row.user_id,
            profile_image_url: row.profile_image_url
          } as CreativeCharacter;
        });

        return {
          characters,
          totalCount: count || 0
        };
      } catch (error) {
        console.error('❌ Error in optimized character fetch:', error);
        throw error;
      }
    },
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes - data doesn't change often
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
};
