
import { CreativeCharacter } from '../types/creativeCharacterTypes';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export class JsonCharacterImporter {
  /**
   * Creates a character directly from a complete JSON object
   * Attributes the character to the current authenticated user
   */
  static async createCharacterFromJson(
    characterJson: any,
    userId: string
  ): Promise<CreativeCharacter> {
    console.log('🎭 Creating character from JSON:', characterJson.name);
    
    // Clean and validate the JSON
    const cleanedCharacter = this.cleanAndValidateJson(characterJson, userId);
    
    // Save to database
    const { data, error } = await supabase
      .from('characters')
      .insert([this.mapToDbFormat(cleanedCharacter)])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error saving character:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('✅ Character created successfully:', data.name);
    return this.mapFromDbFormat(data);
  }

  /**
   * Cleans the JSON to prevent text pollution and validates required fields
   */
  private static cleanAndValidateJson(json: any, userId: string): CreativeCharacter {
    console.log('🧹 Cleaning and validating character JSON');
    
    // Generate new IDs if not present or if reassigning to new user
    const characterId = json.character_id || uuidv4();
    const currentDate = new Date().toISOString();
    
    // Clean trait profile descriptions to prevent text pollution
    const cleanedTraitProfile = this.cleanTraitProfile(json.trait_profile || {});
    
    // Determine proper entity type
    const properEntityType = this.determineEntityType(json);
    
    return {
      character_id: characterId,
      name: json.name || 'Unnamed Character',
      character_type: properEntityType === 'human' ? 'fictional' : 'multi_species',
      creation_source: 'creative',
      creation_date: currentDate,
      created_at: currentDate,
      user_id: userId, // Attribute to current user
      
      trait_profile: {
        ...cleanedTraitProfile,
        entity_type: properEntityType,
        functional_role: cleanedTraitProfile.functional_role || 'undefined_role'
      },
      
      metadata: {
        ...json.metadata,
        creation_method: 'json_import',
        version: '4.1',
        module: 'character_lab',
        trait_architecture: 'enhanced_v4',
        entity_classification: properEntityType,
        imported_at: currentDate
      },
      
      behavioral_modulation: this.generateBehavioralModulation(properEntityType, json.behavioral_modulation),
      
      linguistic_profile: {
        default_output_length: 'medium',
        speech_register: properEntityType === 'human' ? 'contextual' : 'entity_appropriate',
        cultural_speech_patterns: 'entity-appropriate',
        ...json.linguistic_profile
      },
      
      interview_sections: json.interview_sections || [],
      preinterview_tags: json.preinterview_tags || [],
      
      simulation_directives: {
        roleplay_style: 'immersive',
        consistency_level: 'high',
        evolution_enabled: true,
        trait_architecture: 'enhanced_v4',
        entity_specific_behaviors: properEntityType !== 'human',
        ...json.simulation_directives
      },
      
      // Conditional emotional triggers
      ...(this.shouldIncludeEmotionalTriggers(properEntityType) && {
        emotional_triggers: json.emotional_triggers || {
          positive_triggers: [],
          negative_triggers: []
        }
      }),
      
      species_type: properEntityType === 'human' ? undefined : properEntityType,
      origin_universe: json.origin_universe || cleanedTraitProfile.narrative_domain,
      enhanced_metadata_version: 4,
      is_public: false, // Default to private for imported characters
      
      // Copy other fields if present
      prompt: json.prompt,
      profile_image_url: json.profile_image_url,
      age: json.age,
      gender: json.gender,
      historical_period: json.historical_period,
      social_class: json.social_class,
      region: json.region,
      physical_appearance: json.physical_appearance,
      form_factor: json.form_factor
    };
  }

  /**
   * Cleans trait profile to prevent text pollution
   */
  private static cleanTraitProfile(traitProfile: any): any {
    const cleaned = { ...traitProfile };
    
    // Clean core motives
    if (cleaned.core_motives) {
      cleaned.core_motives = cleaned.core_motives.map((motive: any) => ({
        ...motive,
        narrative_description: this.cleanTextPollution(motive.narrative_description)
      }));
    }
    
    // Clean latent values
    if (cleaned.latent_values) {
      cleaned.latent_values = cleaned.latent_values.map((value: any) => ({
        ...value,
        narrative_description: this.cleanTextPollution(value.narrative_description)
      }));
    }
    
    // Remove empty or confusing fields
    delete cleaned.core_drives; // Remove to prevent confusion
    
    return cleaned;
  }

  /**
   * Removes text pollution patterns
   */
  private static cleanTextPollution(text: string): string {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/Does not possess rigid bodies but manifest.*/gi, '')
      .replace(/\.\.\..*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Determines proper entity type from JSON data
   */
  private static determineEntityType(json: any): string {
    const description = json.trait_profile?.description?.toLowerCase() || '';
    const physicalForm = json.trait_profile?.physical_form?.toLowerCase() || '';
    
    if (description.includes('coil') || description.includes('crystalline') || 
        description.includes('translucent') || description.includes('vapor') ||
        physicalForm.includes('energy') || physicalForm.includes('fluid')) {
      return 'non_humanoid';
    }
    
    if (description.includes('post-biological')) {
      return 'post_biological';
    }
    
    return json.trait_profile?.entity_type || 'non_humanoid';
  }

  /**
   * Generates appropriate behavioral modulation based on entity type
   */
  private static generateBehavioralModulation(entityType: string, existing?: any): any {
    const base = existing || {};
    
    if (entityType === 'human') {
      return {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.7,
        patience: 0.6,
        ...base
      };
    }
    
    return {
      formality: 0.3,
      enthusiasm: 0.4,
      assertiveness: 0.7,
      empathy: 0.4,
      patience: 0.8,
      ...base
    };
  }

  /**
   * Determines if emotional triggers should be included
   */
  private static shouldIncludeEmotionalTriggers(entityType: string): boolean {
    return entityType === 'human' || entityType === 'post_biological';
  }

  /**
   * Maps CreativeCharacter to database format
   */
  private static mapToDbFormat(character: CreativeCharacter): any {
    return {
      character_id: character.character_id,
      name: character.name,
      character_type: character.character_type,
      creation_source: character.creation_source,
      creation_date: character.creation_date,
      created_at: character.created_at,
      user_id: character.user_id,
      metadata: character.metadata,
      behavioral_modulation: character.behavioral_modulation,
      interview_sections: character.interview_sections,
      linguistic_profile: character.linguistic_profile,
      preinterview_tags: character.preinterview_tags,
      simulation_directives: character.simulation_directives,
      trait_profile: character.trait_profile,
      emotional_triggers: character.emotional_triggers,
      prompt: character.prompt,
      is_public: character.is_public,
      profile_image_url: character.profile_image_url,
      enhanced_metadata_version: character.enhanced_metadata_version,
      age: character.age,
      gender: character.gender,
      historical_period: character.historical_period,
      social_class: character.social_class,
      region: character.region,
      physical_appearance: character.physical_appearance,
      origin_universe: character.origin_universe,
      species_type: character.species_type,
      form_factor: character.form_factor
    };
  }

  /**
   * Maps database format to CreativeCharacter
   */
  private static mapFromDbFormat(data: any): CreativeCharacter {
    return {
      id: data.id,
      character_id: data.character_id,
      name: data.name,
      character_type: data.character_type,
      creation_source: data.creation_source,
      creation_date: data.creation_date,
      created_at: data.created_at,
      user_id: data.user_id,
      metadata: data.metadata,
      behavioral_modulation: data.behavioral_modulation,
      interview_sections: data.interview_sections,
      linguistic_profile: data.linguistic_profile,
      preinterview_tags: data.preinterview_tags,
      simulation_directives: data.simulation_directives,
      trait_profile: data.trait_profile,
      emotional_triggers: data.emotional_triggers,
      prompt: data.prompt,
      is_public: data.is_public,
      profile_image_url: data.profile_image_url,
      enhanced_metadata_version: data.enhanced_metadata_version,
      age: data.age,
      gender: data.gender,
      historical_period: data.historical_period,
      social_class: data.social_class,
      region: data.region,
      physical_appearance: data.physical_appearance,
      origin_universe: data.origin_universe,
      species_type: data.species_type,
      form_factor: data.form_factor
    };
  }
}
