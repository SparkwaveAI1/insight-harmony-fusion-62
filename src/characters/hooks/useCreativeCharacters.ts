
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
        .eq('character_type', 'fictional')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching creative characters:', error);
        throw error;
      }

      console.log('✅ Creative characters fetched:', data?.length || 0);
      
      // Map database results to Character type with safe type casting
      return data ? data.map((dbRow): Character => ({
        id: dbRow.id,
        character_id: dbRow.character_id,
        name: dbRow.name,
        character_type: dbRow.character_type as 'historical' | 'fictional' | 'multi_species',
        creation_source: 'creative',
        creation_date: dbRow.creation_date,
        created_at: dbRow.created_at || dbRow.creation_date,
        metadata: (typeof dbRow.metadata === 'object' && dbRow.metadata !== null) ? dbRow.metadata : {},
        behavioral_modulation: (typeof dbRow.behavioral_modulation === 'object' && dbRow.behavioral_modulation !== null) 
          ? dbRow.behavioral_modulation as any : {},
        interview_sections: Array.isArray(dbRow.interview_sections) ? dbRow.interview_sections : [],
        linguistic_profile: (typeof dbRow.linguistic_profile === 'object' && dbRow.linguistic_profile !== null)
          ? dbRow.linguistic_profile as any : {},
        preinterview_tags: Array.isArray(dbRow.preinterview_tags) ? dbRow.preinterview_tags : [],
        simulation_directives: (typeof dbRow.simulation_directives === 'object' && dbRow.simulation_directives !== null)
          ? dbRow.simulation_directives : {},
        trait_profile: (typeof dbRow.trait_profile === 'object' && dbRow.trait_profile !== null)
          ? dbRow.trait_profile as any : {},
        emotional_triggers: undefined, // Character Lab doesn't use emotional triggers
        prompt: dbRow.prompt || undefined,
        user_id: dbRow.user_id || undefined,
        is_public: dbRow.is_public || false,
        profile_image_url: dbRow.profile_image_url || undefined,
        enhanced_metadata_version: dbRow.enhanced_metadata_version || undefined,
        age: dbRow.age || undefined,
        gender: dbRow.gender || undefined,
        historical_period: dbRow.historical_period || undefined,
        social_class: dbRow.social_class || undefined,
        region: dbRow.region || undefined,
        physical_appearance: (typeof dbRow.physical_appearance === 'object' && dbRow.physical_appearance !== null)
          ? dbRow.physical_appearance : {},
        origin_universe: dbRow.origin_universe || undefined,
        species_type: dbRow.species_type || undefined,
        form_factor: dbRow.form_factor || undefined,
      })) : [];
    },
  });
};
