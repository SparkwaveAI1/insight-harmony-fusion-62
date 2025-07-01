
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';

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
      
      // Map database results to Character type
      return data ? data.map((dbRow): Character => ({
        id: dbRow.id,
        character_id: dbRow.character_id,
        name: dbRow.name,
        character_type: dbRow.character_type as 'historical' | 'fictional' | 'multi_species',
        creation_source: (dbRow.creation_source as 'historical' | 'creative') || 'creative',
        creation_date: dbRow.creation_date,
        created_at: dbRow.created_at || dbRow.creation_date,
        metadata: dbRow.metadata || {},
        behavioral_modulation: dbRow.behavioral_modulation || {},
        interview_sections: dbRow.interview_sections || [],
        linguistic_profile: dbRow.linguistic_profile || {},
        preinterview_tags: dbRow.preinterview_tags || [],
        simulation_directives: dbRow.simulation_directives || {},
        trait_profile: dbRow.trait_profile || {},
        emotional_triggers: dbRow.emotional_triggers,
        prompt: dbRow.prompt,
        user_id: dbRow.user_id,
        is_public: dbRow.is_public,
        profile_image_url: dbRow.profile_image_url,
        enhanced_metadata_version: dbRow.enhanced_metadata_version,
        age: dbRow.age,
        gender: dbRow.gender,
        historical_period: dbRow.historical_period,
        social_class: dbRow.social_class,
        region: dbRow.region,
        physical_appearance: dbRow.physical_appearance,
        origin_universe: dbRow.origin_universe,
        species_type: dbRow.species_type,
        form_factor: dbRow.form_factor,
      })) : [];
    },
  });
};
