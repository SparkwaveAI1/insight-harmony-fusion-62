
import { CreativeCharacterData, CreativeCharacter } from '../types/creativeCharacterTypes';
import { CreativeTraitArchitectureBuilder } from './creativeTraitArchitectureBuilder';
import { v4 as uuidv4 } from 'uuid';

export class CreativeCharacterBuilder {
  static buildCharacter(data: CreativeCharacterData, userId: string): CreativeCharacter {
    const characterId = uuidv4();
    const creationDate = new Date().toISOString();
    
    // Determine proper entity type
    const properEntityType = CreativeTraitArchitectureBuilder.determineEntityType(data);
    
    // Generate the new trait architecture
    const traitArchitecture = CreativeTraitArchitectureBuilder.buildTraitArchitecture(data);
    
    // Extract structured communication method
    const communicationMethod = CreativeTraitArchitectureBuilder.extractCommunicationMethod(data);
    
    // Extract structured physical appearance
    const physicalAppearance = CreativeTraitArchitectureBuilder.extractPhysicalAppearance(data);
    
    return {
      character_id: characterId,
      name: data.name,
      character_type: properEntityType === 'human' ? 'fictional' : 'multi_species',
      creation_source: 'creative',
      creation_date: creationDate,
      created_at: creationDate,
      user_id: userId,
      
      // Character Lab's enhanced trait profile with new architecture
      trait_profile: {
        entity_type: properEntityType, // Use properly determined entity type
        narrative_domain: data.narrativeDomain,
        functional_role: data.functionalRole || this.determineFunctionalRole(data),
        description: data.description,
        environment: data.environment,
        physical_form: data.physicalForm,
        communication_method: communicationMethod, // Structured communication method
        
        // New Character Lab trait architecture
        core_motives: traitArchitecture.core_motives,
        latent_values: traitArchitecture.latent_values,
        symbolic_traits: traitArchitecture.symbolic_traits,
        cognitive_filters: traitArchitecture.cognitive_filters,
        
        // Remove empty core_drives to prevent confusion
        // core_drives: data.coreDrives, // REMOVED - was causing confusion
        surface_triggers: data.surfaceTriggers,
        change_response_style: data.changeResponseStyle,
        
        // Creative character specific traits
        creative_personality: {
          imagination_level: 0.7,
          expressiveness: 0.6,
          social_comfort: properEntityType === 'human' ? 0.5 : 0.3, // Adjust based on entity type
          collaborative_nature: 0.6,
          emotional_depth: properEntityType === 'human' ? 0.7 : 0.4 // Non-humanoids may have different emotional processing
        },
        
        decision_approach: {
          conflict_style: data.changeResponseStyle,
          adaptability: 0.6,
          change_threshold: 0.5
        },
        
        // Enhanced physical appearance structure
        physical_appearance: physicalAppearance
      },
      
      // Standard required fields for database compatibility
      metadata: {
        creation_method: 'character_lab',
        version: '4.1', // Updated version
        module: 'character_lab',
        trait_architecture: 'enhanced_v4',
        entity_classification: properEntityType
      },
      
      behavioral_modulation: this.generateBehavioralModulation(properEntityType),
      
      linguistic_profile: {
        default_output_length: 'medium',
        speech_register: properEntityType === 'human' ? 'contextual' : 'entity_appropriate',
        cultural_speech_patterns: 'entity-appropriate'
      },
      
      interview_sections: [],
      preinterview_tags: [],
      
      // Enhanced simulation directives with conditional logic
      simulation_directives: {
        roleplay_style: 'immersive',
        consistency_level: 'high',
        evolution_enabled: true,
        trait_architecture: 'enhanced_v4',
        entity_specific_behaviors: properEntityType !== 'human'
      },
      
      // Conditional emotional triggers - only for entities that process emotions
      ...(this.shouldIncludeEmotionalTriggers(properEntityType) && {
        emotional_triggers: {
          positive_triggers: this.generatePositiveTriggers(data),
          negative_triggers: this.generateNegativeTriggers(data)
        }
      }),
      
      // Character-specific fields
      species_type: properEntityType === 'human' ? undefined : properEntityType,
      origin_universe: data.narrativeDomain,
      enhanced_metadata_version: 4,
      is_public: false
    };
  }

  private static determineFunctionalRole(data: CreativeCharacterData): string {
    const description = data.description?.toLowerCase() || '';
    const environment = data.environment?.toLowerCase() || '';
    
    if (description.includes('guardian') || description.includes('protector')) {
      return 'guardian_entity';
    }
    
    if (description.includes('oracle') || description.includes('divination')) {
      return 'oracle_interpreter';
    }
    
    if (description.includes('ritual') || description.includes('ceremony')) {
      return 'ritual_coordinator';
    }
    
    if (environment.includes('spiral') || environment.includes('continuum')) {
      return 'dimensional_navigator';
    }
    
    return 'undefined_role';
  }

  private static generateBehavioralModulation(entityType: string): any {
    // Adjust behavioral modulation based on entity type
    if (entityType === 'human') {
      return {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.7,
        patience: 0.6
      };
    }
    
    // Non-humanoid entities have different behavioral parameters
    return {
      formality: 0.3, // Less concerned with human social conventions
      enthusiasm: 0.4, // More measured responses
      assertiveness: 0.7, // Often more direct
      empathy: 0.4, // Different emotional processing
      patience: 0.8 // Often operate on different timescales
    };
  }

  private static shouldIncludeEmotionalTriggers(entityType: string): boolean {
    // Only include emotional triggers for entities that process emotions in human-like ways
    return entityType === 'human' || entityType === 'post_biological';
  }

  private static generatePositiveTriggers(data: CreativeCharacterData): string[] {
    const triggers: string[] = [];
    
    if (data.narrativeDomain?.includes('fantasy')) {
      triggers.push('magical_resonance', 'harmonic_alignment');
    }
    
    if (data.environment?.includes('spiral')) {
      triggers.push('pattern_completion', 'dimensional_stability');
    }
    
    return triggers.length > 0 ? triggers : ['undefined_positive'];
  }

  private static generateNegativeTriggers(data: CreativeCharacterData): string[] {
    const triggers: string[] = [];
    
    if (data.changeResponseStyle === 'collapse_destabilize') {
      triggers.push('system_chaos', 'pattern_disruption');
    }
    
    if (data.environment?.includes('continuum')) {
      triggers.push('temporal_fractures', 'reality_tears');
    }
    
    return triggers.length > 0 ? triggers : ['undefined_negative'];
  }
}
