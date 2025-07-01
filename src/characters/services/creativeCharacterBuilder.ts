
import { CreativeCharacterData, Character, CharacterTraitProfile } from '../types/characterTraitTypes';
import { v4 as uuidv4 } from 'uuid';

export class CreativeCharacterBuilder {
  
  static generateCognitiveModel(data: CreativeCharacterData) {
    const cognitivePatterns = {
      'sci-fi': {
        temporal_perception: 'quantum-parallel processing',
        pattern_preference: 'algorithmic cascade detection',
        cognitive_form: 'data-stream synthesis'
      },
      'fantasy': {
        temporal_perception: 'cyclical-seasonal awareness',
        pattern_preference: 'mystical resonance tracking',
        cognitive_form: 'intuitive essence reading'
      },
      'horror': {
        temporal_perception: 'fragmented memory layering',
        pattern_preference: 'threat-anticipation focus',
        cognitive_form: 'survival instinct override'
      },
      'mystery': {
        temporal_perception: 'sequential detail cataloging',
        pattern_preference: 'anomaly detection emphasis',
        cognitive_form: 'deductive reasoning chains'
      },
      'default': {
        temporal_perception: 'present-moment anchoring',
        pattern_preference: 'contextual relationship mapping',
        cognitive_form: 'adaptive pattern synthesis'
      }
    };

    const domain = data.narrativeDomain.toLowerCase();
    const baseModel = cognitivePatterns[domain as keyof typeof cognitivePatterns] || cognitivePatterns.default;
    
    return {
      ...baseModel,
      processing_speed: data.entityType === 'human' ? 'biological standard' : 'entity-specific variable',
      memory_architecture: data.changeResponseStyle === 'adapt_preserve' ? 'layered preservation' : 'dynamic restructuring'
    };
  }

  static generateConstraintModel(data: CreativeCharacterData) {
    const constraintStyles = {
      'adapt_preserve': {
        enforcement_style: 'gentle guidance',
        deviation_tolerance: 0.7,
        constraint_type: 'soft' as const
      },
      'mutate_adapt': {
        enforcement_style: 'flexible boundaries',
        deviation_tolerance: 0.8,
        constraint_type: 'adaptive' as const
      },
      'resist_change': {
        enforcement_style: 'rigid adherence',
        deviation_tolerance: 0.3,
        constraint_type: 'hard' as const
      }
    };

    const baseConstraints = constraintStyles[data.changeResponseStyle as keyof typeof constraintStyles] || constraintStyles.mutate_adapt;
    
    // Generate contextual forbidden behaviors based on narrative domain
    const forbiddenBehaviors = this.generateForbiddenBehaviors(data.narrativeDomain, data.entityType);
    const requiredRituals = this.generateRequiredRituals(data.narrativeDomain, data.coreDrives);

    return {
      ...baseConstraints,
      forbidden_behaviors: forbiddenBehaviors,
      required_rituals: requiredRituals
    };
  }

  static generateEvolutionModel(data: CreativeCharacterData) {
    const evolutionConditions = [
      `Contradiction with core drive: ${data.coreDrives[0] || 'primary motivation'}`,
      `Environmental pressure from: ${data.environment}`,
      `Interaction paradox regarding: ${data.communication}`
    ];

    const adaptationStyles = {
      'adapt_preserve': 'incremental adjustment',
      'mutate_adapt': 'transformative flexibility',
      'resist_change': 'minimal accommodation'
    };

    return {
      evolution_conditions: evolutionConditions,
      trait_mutation_history: [], // Initialize empty for new characters
      contradiction_tolerance: data.changeResponseStyle === 'resist_change' ? 0.2 : 0.6,
      adaptation_style: adaptationStyles[data.changeResponseStyle as keyof typeof adaptationStyles],
      growth_rate: data.changeResponseStyle === 'mutate_adapt' ? 0.8 : 0.4,
      transformation_triggers: data.surfaceTriggers.slice(0, 3) // Use first 3 surface triggers
    };
  }

  static generateAppearanceDescription(data: CreativeCharacterData): string {
    const domainModifiers = {
      'sci-fi': 'with technological augmentations and energy emanations',
      'fantasy': 'with mystical auras and arcane symbols',
      'horror': 'with unsettling features and shadow distortions',
      'mystery': 'with subtle enigmatic qualities and hidden depths',
      'default': 'with distinctive characteristic features'
    };

    const entityDescriptors = {
      'human': 'humanoid figure',
      'animal': 'creature form',
      'plant': 'botanical entity',
      'energy': 'energy manifestation',
      'hybrid': 'hybrid being',
      'other': 'unique entity'
    };

    const domain = data.narrativeDomain.toLowerCase();
    const modifier = domainModifiers[domain as keyof typeof domainModifiers] || domainModifiers.default;
    const descriptor = entityDescriptors[data.entityType as keyof typeof entityDescriptors] || entityDescriptors.other;

    let description = `${data.name} appears as a ${descriptor} ${modifier}.`;
    
    if (data.physicalForm) {
      description += ` ${data.physicalForm}.`;
    }
    
    if (data.environment) {
      description += ` Naturally found in ${data.environment}, their presence harmonizes with this environment.`;
    }

    if (data.communication) {
      description += ` They communicate through ${data.communication}, which influences their physical manifestation.`;
    }

    return description;
  }

  static generateAppearanceModel(data: CreativeCharacterData) {
    const visualThemes = {
      'sci-fi': 'technological-futuristic',
      'fantasy': 'mystical-arcane',
      'horror': 'dark-unsettling',
      'mystery': 'enigmatic-subtle'
    };

    const aestheticClasses = {
      'human': 'anthropomorphic',
      'animal': 'zoomorphic',
      'plant': 'botanical',
      'energy': 'ethereal',
      'hybrid': 'chimeric',
      'other': 'abstract'
    };

    return {
      appearance_description: this.generateAppearanceDescription(data),
      aesthetic_class: aestheticClasses[data.entityType as keyof typeof aestheticClasses] || 'abstract',
      visual_theme: visualThemes[data.narrativeDomain.toLowerCase() as keyof typeof visualThemes] || 'naturalistic',
      signature_features: this.generateSignatureFeatures(data)
    };
  }

  static generateSignatureFeatures(data: CreativeCharacterData): string[] {
    const features = [];
    
    if (data.coreDrives.length > 0) {
      features.push(`Motivation-driven: ${data.coreDrives[0]} manifestation`);
    }
    
    if (data.physicalForm) {
      features.push(`Physical trait: ${data.physicalForm}`);
    }
    
    if (data.communication !== 'speech') {
      features.push(`Communication method: ${data.communication}`);
    }

    return features.slice(0, 3); // Limit to top 3 signature features
  }

  static generateForbiddenBehaviors(narrativeDomain: string, entityType: string): string[] {
    const domainBehaviors = {
      'sci-fi': ['violating technological protocols', 'ignoring data integrity'],
      'fantasy': ['breaking magical laws', 'desecrating sacred spaces'],
      'horror': ['revealing hidden truths prematurely', 'showing vulnerability openly'],
      'mystery': ['solving puzzles too quickly', 'revealing all knowledge at once']
    };

    const entityBehaviors = {
      'human': ['acting purely on instinct', 'ignoring social context'],
      'animal': ['complex abstract reasoning', 'sophisticated tool use'],
      'plant': ['rapid movement', 'aggressive behavior'],
      'energy': ['maintaining fixed form', 'material attachment'],
      'other': ['following conventional patterns', 'predictable responses']
    };

    const domain = narrativeDomain.toLowerCase();
    const forbidden = [
      ...(domainBehaviors[domain as keyof typeof domainBehaviors] || []),
      ...(entityBehaviors[entityType as keyof typeof entityBehaviors] || [])
    ];

    return forbidden.slice(0, 4); // Limit to top 4 forbidden behaviors
  }

  static generateRequiredRituals(narrativeDomain: string, coreDrives: string[]): string[] {
    const domainRituals = {
      'sci-fi': ['data verification protocols', 'system status checks'],
      'fantasy': ['daily attunement practices', 'elemental acknowledgments'],
      'horror': ['protective ward maintenance', 'fear assessment rituals'],
      'mystery': ['evidence cataloging', 'pattern verification checks']
    };

    const driveRituals = coreDrives.map(drive => 
      `${drive.toLowerCase().replace(/\s+/g, '_')}_affirmation_practice`
    );

    const domain = narrativeDomain.toLowerCase();
    const rituals = [
      ...(domainRituals[domain as keyof typeof domainRituals] || ['daily_existence_acknowledgment']),
      ...driveRituals.slice(0, 2) // Limit drive rituals
    ];

    return rituals.slice(0, 4); // Limit to top 4 required rituals
  }

  static buildEnhancedTraitProfile(data: CreativeCharacterData): CharacterTraitProfile {
    return {
      // Core identity
      entity_type: data.entityType,
      narrative_domain: data.narrativeDomain,
      functional_role: data.functionalRole,
      description: data.description,
      
      // Creative character traits
      core_drives: data.coreDrives,
      surface_triggers: data.surfaceTriggers,
      change_response_style: data.changeResponseStyle,
      
      // Enhanced Character Lab systems
      cognition_model: this.generateCognitiveModel(data),
      constraint_model: this.generateConstraintModel(data),
      evolution_model: this.generateEvolutionModel(data),
      appearance_model: this.generateAppearanceModel(data),
      
      // Physical characteristics
      physical_form: data.physicalForm,
      environment: data.environment,
      communication_method: data.communication,
      
      // Auto-generated personality summary
      personality_summary: this.generatePersonalitySummary(data)
    };
  }

  static generatePersonalitySummary(data: CreativeCharacterData): string {
    const driveText = data.coreDrives.length > 0 ? data.coreDrives[0] : 'existence';
    const responseText = data.changeResponseStyle.replace('_', ' ');
    const entityText = data.entityType === 'other' ? 'unique entity' : data.entityType;
    
    return `An ${entityText} of ${data.narrativeDomain.toLowerCase()}, driven by ${driveText}, with a tendency to ${responseText} when faced with change. Exists within ${data.environment} and manifests through ${data.communication}.`;
  }

  static buildCharacter(data: CreativeCharacterData, userId: string): Character {
    const characterId = uuidv4();
    const creationDate = new Date().toISOString();
    
    return {
      character_id: characterId,
      name: data.name,
      character_type: data.entityType === 'human' ? 'fictional' : 'multi_species',
      creation_source: 'creative',
      creation_date: creationDate,
      created_at: creationDate,
      user_id: userId,
      
      // Enhanced trait profile with all new systems
      trait_profile: this.buildEnhancedTraitProfile(data),
      
      // Standard required fields with flexible JSON compatibility
      metadata: {
        creation_method: 'enhanced_character_lab',
        version: '2.0',
        enhancement_level: 'full_cognitive_model'
      } as any,
      behavioral_modulation: {
        formality: 0.5,
        enthusiasm: 0.6,
        assertiveness: 0.5,
        empathy: 0.7,
        patience: 0.6
      } as any,
      linguistic_profile: {
        default_output_length: 'medium',
        speech_register: 'contextual',
        cultural_speech_patterns: 'entity-appropriate'
      } as any,
      interview_sections: [],
      preinterview_tags: [],
      simulation_directives: {
        roleplay_style: 'immersive',
        consistency_level: 'high',
        evolution_enabled: true
      },
      
      // Simplified emotional triggers for Character Lab - using simple arrays
      emotional_triggers: {
        positive_triggers: data.coreDrives.map(drive => `Success in ${drive.toLowerCase()}`),
        negative_triggers: data.surfaceTriggers.map(trigger => `Interference with ${trigger.toLowerCase()}`)
      } as any,
      
      // Character-specific fields
      species_type: data.entityType === 'human' ? undefined : data.entityType,
      origin_universe: data.narrativeDomain,
      enhanced_metadata_version: 2,
      is_public: false
    };
  }
}
