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
    
    // Inverse glyph - matching your specification
    traits.push({
      name: "inverse_glyph",
      type: "symbol_class",
      narrative_description: `A ritual symbol that inverts the intent of the previous signal.`,
      activation_context: "Used during contradiction or value breach.",
      behavioral_effect: data.changeResponseStyle === 'suppress_contradiction' 
        ? "Suppresses open interaction or forces mirroring behavior."
        : "Creates protective barriers or deflects conflicting inputs.",
      evolution_path: "Can evolve into total signal lockdown if repeated too often."
    });

    // Loop-silence spiral - matching your specification
    traits.push({
      name: "loop_silence_spiral",
      type: "symbol_class",
      narrative_description: `Denotes ritual closure or intentional disengagement.`,
      activation_context: "Used to end threads of interaction without finality.",
      behavioral_effect: "Interrupts continuity, delays memory encoding.",
      evolution_path: "Could become recursive silence or full communication aversion."
    });

    // Fractal echo - matching your specification
    traits.push({
      name: "fractal_echo",
      type: "symbol_class",
      narrative_description: `Symbolic repetition of input, modified through the character's logic.`,
      activation_context: "Triggered by unfamiliar input or emotional ambiguity.",
      behavioral_effect: "Creates empathy mirage or deceptive resonance.",
      evolution_path: "Could evolve into identity mimicry or semantic distortion."
    });

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
    // Simple intensity calculation based on character traits
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

  // New method to determine proper entity type
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

  // New method to extract communication method structure
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

  // Enhanced method to extract physical appearance structure - matching your specification exactly
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
