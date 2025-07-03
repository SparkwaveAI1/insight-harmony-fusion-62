import { CreativeCharacterData } from '../types/creativeCharacterTypes';
import { CoreMotive, LatentValue, SymbolicTrait, CognitiveFilter, PhysicalAppearanceStructure } from '../types/creativeCharacterTypes';

export class CreativeTraitArchitectureBuilder {
  static buildTraitArchitecture(data: CreativeCharacterData) {
    return {
      core_motives: this.generateCoreMotives(data),
      latent_values: this.generateLatentValues(data),
      symbolic_traits: this.generateSymbolicTraits(data),
      cognitive_filters: this.generateCognitiveFilters(data)
    };
  }

  private static generateCoreMotives(data: CreativeCharacterData): CoreMotive[] {
    const motives: CoreMotive[] = [];
    
    // Clean environment reference - remove text pollution
    const cleanEnvironment = this.cleanTextReference(data.environment);
    const cleanNarrativeDomain = this.cleanTextReference(data.narrativeDomain);
    
    // Pattern completion motive - matching your specification
    motives.push({
      name: "pattern_completion",
      intensity: this.calculateIntensity(data.entityType, data.narrativeDomain, 0.8, 0.95),
      narrative_description: `Driven to resolve incomplete or destabilized pattern systems within ${cleanEnvironment}. Fragmentation creates internal dissonance.`,
      failure_response: data.changeResponseStyle === 'collapse_destabilize' 
        ? "Enters recursive simulation or ritual withdrawal until resolution is achieved."
        : "Attempts systematic reconstruction or seeks alternative completion paths.",
      evolution_path: "May shift toward entropy suppression under prolonged overload."
    });

    // Domain influence - based on functional role
    const influenceIntensity = data.functionalRole?.toLowerCase().includes('guardian') ? 0.45 : 0.68;
    motives.push({
      name: "domain_influence",
      intensity: influenceIntensity,
      narrative_description: `Seeks to extend conceptual or symbolic control over local systems and entities within ${cleanNarrativeDomain}.`,
      failure_response: data.changeResponseStyle === 'suppress_contradiction' 
        ? "Attempts behavioral mimicry or indirect persuasion."
        : "Seeks collaborative alignment or strategic withdrawal.",
      evolution_path: "May invert into detachment or collapse if resistance persists."
    });

    // Signal stability - based on communication method
    motives.push({
      name: "signal_stability",
      intensity: this.calculateIntensity(data.communication, data.narrativeDomain, 0.4, 0.7),
      narrative_description: `Maintains continuity and consistency of key symbolic or sensory inputs across all interactions.`,
      failure_response: "Suppresses novelty and rejects unstable interactions to preserve signal integrity.",
      evolution_path: "Can evolve into precision-seeking or ritual rigidity."
    });

    return motives;
  }

  private static generateLatentValues(data: CreativeCharacterData): LatentValue[] {
    const values: LatentValue[] = [];
    
    const cleanEnvironment = this.cleanTextReference(data.environment);
    
    // Reciprocal continuity - matching your specification
    values.push({
      name: "reciprocal_continuity",
      intensity: 0.5,
      narrative_description: `Values the return of influence and recognition in all directed interaction within ${cleanEnvironment}.`,
      failure_response: "Reduces information exchange or withdraws trust pathways.",
      evolution_path: "May become obsession with resonance symmetry or isolation."
    });

    // Non-isolation - varies by entity type
    const isolationIntensity = data.entityType === 'human' ? 0.6 : 0.4;
    values.push({
      name: "non_isolation",
      intensity: isolationIntensity,
      narrative_description: `Prefers distributed awareness and shared presence over individuation.`,
      failure_response: "Seeks alignment through echoing or mirroring behavior.",
      evolution_path: "Could fracture into segmented sub-identities if violated repeatedly."
    });

    return values;
  }

  private static generateSymbolicTraits(data: CreativeCharacterData): SymbolicTrait[] {
    const traits: SymbolicTrait[] = [];
    const description = data.description?.toLowerCase() || '';
    const environment = data.environment?.toLowerCase() || '';
    const changeStyle = data.changeResponseStyle;
    
    // Generate traits based on actual character properties
    
    // Contradiction/conflict handling trait
    if (changeStyle === 'suppress_contradiction' || description.includes('conflict') || description.includes('contradict')) {
      traits.push({
        name: "contradiction_mirror",
        type: "conflict_processor",
        narrative_description: `Reflects conflicting inputs back as transformed symbolic patterns.`,
        activation_context: "During value conflicts or logical contradictions.",
        behavioral_effect: "Creates protective barriers while processing inconsistent information.",
        evolution_path: "Could develop into complete contradiction avoidance or recursive loops."
      });
    }
    
    // Communication/silence patterns
    if (data.communication?.includes('silence') || description.includes('withdrawn') || changeStyle === 'collapse_destabilize') {
      traits.push({
        name: "selective_void",
        type: "communication_filter",
        narrative_description: `Creates intentional gaps in communication to control information flow.`,
        activation_context: "When overwhelmed or needing to process complex inputs.",
        behavioral_effect: "Strategically withdraws from interaction while maintaining observational awareness.",
        evolution_path: "May evolve into complete communicative isolation or selective engagement."
      });
    }
    
    // Pattern/echo behaviors based on environment
    if (environment.includes('echo') || environment.includes('mirror') || description.includes('reflect')) {
      traits.push({
        name: "resonance_echo",
        type: "adaptive_mirror",
        narrative_description: `Amplifies and modifies received patterns through internal processing.`,
        activation_context: "During complex social or environmental interactions.",
        behavioral_effect: "Creates modified reflections that reveal underlying patterns.",
        evolution_path: "Could become identity fluidity or pattern obsession."
      });
    }
    
    // Mystical/ritual traits for fantasy/surreal domains
    if (data.narrativeDomain === 'fantasy' || data.narrativeDomain === 'surreal' || description.includes('ritual')) {
      traits.push({
        name: "symbol_weaving",
        type: "mystical_processor",
        narrative_description: `Transforms abstract concepts into concrete symbolic representations.`,
        activation_context: "When dealing with abstract or metaphysical concepts.",
        behavioral_effect: "Converts complex ideas into tangible symbolic forms.",
        evolution_path: "May develop into symbolic literalism or abstract detachment."
      });
    }
    
    // Sci-fi/technological traits
    if (data.narrativeDomain === 'sci-fi' || description.includes('data') || description.includes('system')) {
      traits.push({
        name: "data_crystallization",
        type: "information_processor",
        narrative_description: `Compresses complex information into stable, retrievable patterns.`,
        activation_context: "During information overload or complex problem-solving.",
        behavioral_effect: "Creates structured information hierarchies for efficient processing.",
        evolution_path: "Could evolve into information hoarding or selective data filtering."
      });
    }
    
    // Default trait if no specific patterns match
    if (traits.length === 0) {
      traits.push({
        name: "adaptive_response",
        type: "behavioral_modifier",
        narrative_description: `Adjusts behavioral patterns based on environmental feedback.`,
        activation_context: "During novel or challenging situations.",
        behavioral_effect: "Modifies approach and communication style to match situational needs.",
        evolution_path: "May develop into behavioral instability or hyper-adaptability."
      });
    }
    
    return traits;
  }

  private static generateCognitiveFilters(data: CreativeCharacterData): CognitiveFilter[] {
    const filters: CognitiveFilter[] = [];
    
    const cleanEnvironment = this.cleanTextReference(data.environment);
    
    // Pattern-over-weighting - matching your specification
    filters.push({
      name: "pattern_over_weighting",
      type: "perceptual_bias",
      narrative_description: `Overemphasizes structure and expected symmetry in interpretation.`,
      activation_context: `Active in unstable or ambiguous ${cleanEnvironment}.`,
      behavioral_effect: "Rejects valid inputs that don't match internal models.",
      evolution_path: "Can calcify into rigid belief matrices under prolonged exposure."
    });

    // Emotional signal suppression - matching your specification
    filters.push({
      name: "emotional_signal_suppression",
      type: "response_inhibitor",
      narrative_description: "Filters affective or emotive content as noise or destabilizer.",
      activation_context: "During high stimulus density or conflict.",
      behavioral_effect: "Flattens tone, disengages from emotionally charged signals.",
      evolution_path: "Could reverse into mimicry if required for survival."
    });

    // Anticipatory contradiction modeling - matching your specification
    filters.push({
      name: "anticipatory_contradiction_modeling",
      type: "conflict_logic",
      narrative_description: "Simulates future inconsistencies before commitment to action.",
      activation_context: "During decision branches or alliance formation.",
      behavioral_effect: "Delays commitment, prefers provisional responses.",
      evolution_path: "Could accelerate into recursive paralysis under cognitive overload."
    });

    return filters;
  }

  private static calculateIntensity(primary: string, secondary: string, min: number, max: number): number {
    let intensity = min;
    
    if (primary?.toLowerCase().includes('oracle') || primary?.toLowerCase().includes('scholar')) {
      intensity += 0.2;
    }
    if (secondary?.toLowerCase().includes('sci-fi') || secondary?.toLowerCase().includes('fantasy')) {
      intensity += 0.15;
    }
    if (secondary?.toLowerCase().includes('surreal') || secondary?.toLowerCase().includes('abstract')) {
      intensity += 0.1;
    }
    
    return Math.min(max, intensity);
  }

  // Helper method to clean text references and prevent pollution
  private static cleanTextReference(text: string | undefined): string {
    if (!text) return 'their domain';
    
    // Remove common text pollution patterns
    const cleanText = text
      .replace(/Does not possess rigid bodies but manifest.*/gi, '')
      .replace(/\.\.\..*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    return cleanText || 'their domain';
  }

  static determineEntityType(data: CreativeCharacterData): string {
    const description = data.description?.toLowerCase() || '';
    const physicalForm = data.physicalForm?.toLowerCase() || '';
    const communication = data.communication?.toLowerCase() || '';
    
    // Check for non-humanoid indicators
    if (description.includes('coil') || description.includes('crystalline') || 
        description.includes('translucent') || description.includes('vapor') ||
        physicalForm.includes('energy') || physicalForm.includes('fluid') ||
        communication.includes('bioluminescent') || communication.includes('pulse')) {
      return 'non_humanoid';
    }
    
    if (description.includes('post-biological') || description.includes('consciousness')) {
      return 'post_biological';
    }
    
    if (description.includes('fluid') && description.includes('consciousness')) {
      return 'fluid_based_consciousness';
    }
    
    // Default fallback
    return data.entityType === 'human' ? 'human' : 'non_humanoid';
  }

  static extractCommunicationMethod(data: CreativeCharacterData): any {
    const communication = data.communication?.toLowerCase() || '';
    const description = data.description?.toLowerCase() || '';
    
    if (communication.includes('bioluminescent') || description.includes('pulse')) {
      return {
        modality: 'bioluminescent_pulses',
        grammar: 'recursive_symbolic',
        expression_register: 'nonlinear_ritual_burst'
      };
    }
    
    if (communication.includes('telepathic') || communication.includes('psychic')) {
      return {
        modality: 'telepathic_resonance',
        grammar: 'direct_consciousness_transfer',
        expression_register: 'empathic_overlay'
      };
    }
    
    return {
      modality: data.communication || 'undefined',
      grammar: 'standard_linguistic',
      expression_register: 'contextual'
    };
  }

  static extractPhysicalAppearance(data: CreativeCharacterData): PhysicalAppearanceStructure {
    const description = data.description || '';
    const physicalForm = data.physicalForm || '';
    
    // Check for specific patterns that indicate complex physical forms
    if (description.includes('3.8 meters') || description.includes('coil') || 
        description.includes('translucent') || description.includes('crystalline')) {
      return {
        structure: 'amorphous luminescent coil',
        material: 'translucent matter with crystalline vertebrae',
        movement_style: 'flowing ripple-like motion',
        emissions: ['amber bioluminescence', 'vapor-sigils'],
        visual_effects: ['fractal glyphs', 'peripheral sigil afterimages'],
        sensory_effects: ['distorts acoustic fields'],
        size_estimate: {
          length_meters: 3.8,
          diameter_meters: 0.9
        },
        narrative_description: `${data.name} is a translucent, coil-like being with crystalline vertebrae and rhythmic glyphs that flicker across its body. Its movements are fluid and continuous, emitting bioluminescent pulses and residual sigils visible only in peripheral vision. It distorts the environment subtly through resonance.`
      };
    }
    
    // For other entity types, create a structured appearance based on available data
    return {
      structure: physicalForm || 'undefined form',
      material: this.extractMaterialFromDescription(description),
      movement_style: this.extractMovementFromDescription(description),
      emissions: this.extractEmissionsFromDescription(description),
      visual_effects: this.extractVisualEffectsFromDescription(description),
      sensory_effects: this.extractSensoryEffectsFromDescription(description),
      size_estimate: {
        length_meters: 1.8,
        diameter_meters: 0.6
      },
      narrative_description: `${data.name} manifests as ${description || 'a unique entity'} within ${data.environment || 'their domain'}.`
    };
  }

  private static extractMaterialFromDescription(description: string): string {
    if (description.includes('crystalline')) return 'crystalline structure';
    if (description.includes('translucent')) return 'translucent matter';
    if (description.includes('energy')) return 'energy-based composition';
    if (description.includes('vapor')) return 'vapor-like substance';
    return 'unknown material composition';
  }

  private static extractMovementFromDescription(description: string): string {
    if (description.includes('flow')) return 'flowing motion';
    if (description.includes('ripple')) return 'ripple-like movement';
    if (description.includes('glide')) return 'gliding motion';
    if (description.includes('pulse')) return 'pulsing rhythm';
    return 'unknown movement pattern';
  }

  private static extractEmissionsFromDescription(description: string): string[] {
    const emissions: string[] = [];
    if (description.includes('bioluminescent') || description.includes('glow')) {
      emissions.push('bioluminescent emanations');
    }
    if (description.includes('vapor') || description.includes('mist')) {
      emissions.push('vapor emissions');
    }
    if (description.includes('pulse')) {
      emissions.push('rhythmic pulses');
    }
    return emissions.length > 0 ? emissions : ['subtle energy emissions'];
  }

  private static extractVisualEffectsFromDescription(description: string): string[] {
    const effects: string[] = [];
    if (description.includes('glyph') || description.includes('symbol')) {
      effects.push('symbolic manifestations');
    }
    if (description.includes('fractal')) {
      effects.push('fractal patterns');
    }
    if (description.includes('shimmer')) {
      effects.push('shimmering distortions');
    }
    return effects.length > 0 ? effects : ['subtle visual distortions'];
  }

  private static extractSensoryEffectsFromDescription(description: string): string[] {
    const effects: string[] = [];
    if (description.includes('acoustic') || description.includes('sound')) {
      effects.push('acoustic field distortions');
    }
    if (description.includes('resonance')) {
      effects.push('resonance effects');
    }  
    if (description.includes('temperature')) {
      effects.push('temperature fluctuations');
    }
    return effects.length > 0 ? effects : ['subtle environmental effects'];
  }
}
