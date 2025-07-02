
import { CreativeCharacterData } from '../types/creativeCharacterTypes';
import { CoreMotive, LatentValue, SymbolicTrait, CognitiveFilter } from '../types/creativeCharacterTypes';

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
    
    // Pattern completion motive - varies based on entity type and domain
    motives.push({
      name: "pattern_completion",
      intensity: this.calculateIntensity(data.entityType, data.narrativeDomain, 0.8, 0.95),
      narrative_description: `Driven to resolve incomplete or destabilized systems within ${cleanEnvironment}. Fragmentation creates internal dissonance that must be resolved through systematic reconstruction.`,
      failure_response: data.changeResponseStyle === 'collapse_destabilize' 
        ? "Enters recursive simulation or complete withdrawal until resolution is achieved."
        : "Attempts systematic reconstruction or seeks alternative completion paths.",
      evolution_path: "May shift toward entropy suppression under prolonged overload."
    });

    // Domain influence - based on functional role
    const influenceIntensity = data.functionalRole?.toLowerCase().includes('guardian') ? 0.45 : 0.68;
    motives.push({
      name: "domain_influence",
      intensity: influenceIntensity,
      narrative_description: `Seeks to extend ${data.functionalRole?.toLowerCase() || 'conceptual'} control over local systems and entities within ${cleanNarrativeDomain}.`,
      failure_response: data.changeResponseStyle === 'suppress_contradiction' 
        ? "Attempts behavioral mimicry or indirect persuasion."
        : "Seeks collaborative alignment or strategic withdrawal.",
      evolution_path: "May invert into detachment or collapse if resistance persists."
    });

    // Signal stability - based on communication method
    motives.push({
      name: "signal_stability",
      intensity: this.calculateIntensity(data.communication, data.narrativeDomain, 0.4, 0.7),
      narrative_description: `Maintains continuity and consistency of ${data.communication || 'key symbolic'} inputs and expressions across all interactions.`,
      failure_response: "Suppresses novelty and rejects unstable interactions to preserve signal integrity.",
      evolution_path: "Can evolve into precision-seeking or ritual rigidity."
    });

    return motives;
  }

  private static generateLatentValues(data: CreativeCharacterData): LatentValue[] {
    const values: LatentValue[] = [];
    
    const cleanEnvironment = this.cleanTextReference(data.environment);
    const cleanNarrativeDomain = this.cleanTextReference(data.narrativeDomain);

    // Reciprocal continuity
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
      narrative_description: `Prefers distributed awareness and shared presence over individuation in ${cleanNarrativeDomain}.`,
      failure_response: "Seeks alignment through echoing or mirroring behavior.",
      evolution_path: "Could fracture into segmented sub-identities if violated repeatedly."
    });

    return values;
  }

  private static generateSymbolicTraits(data: CreativeCharacterData): SymbolicTrait[] {
    const traits: SymbolicTrait[] = [];
    
    const cleanNarrativeDomain = this.cleanTextReference(data.narrativeDomain);

    // Inverse glyph - based on change response style
    traits.push({
      name: "inverse_glyph",
      type: "symbol_class",
      narrative_description: `A ${cleanNarrativeDomain} symbol that inverts the intent of the previous signal.`,
      activation_context: "Used during contradiction or value breach.",
      behavioral_effect: data.changeResponseStyle === 'suppress_contradiction' 
        ? "Suppresses open interaction or forces mirroring behavior."
        : "Creates protective barriers or deflects conflicting inputs.",
      evolution_path: "Can evolve into total signal lockdown if repeated too often."
    });

    // Loop-silence spiral
    traits.push({
      name: "loop_silence_spiral",
      type: "symbol_class",
      narrative_description: `Denotes ${data.functionalRole?.toLowerCase() || 'ritual'} closure or intentional disengagement.`,
      activation_context: "Used to end threads of interaction without finality.",
      behavioral_effect: "Interrupts continuity, delays memory encoding.",
      evolution_path: "Could become recursive silence or full communication aversion."
    });

    // Fractal echo - based on communication style
    traits.push({
      name: "fractal_echo",
      type: "symbol_class",
      narrative_description: `Symbolic repetition of input, modified through the character's ${data.communication || 'unique'} logic.`,
      activation_context: "Triggered by unfamiliar input or emotional ambiguity.",
      behavioral_effect: "Creates empathy mirage or deceptive resonance.",
      evolution_path: "Could evolve into identity mimicry or semantic distortion."
    });

    return traits;
  }

  private static generateCognitiveFilters(data: CreativeCharacterData): CognitiveFilter[] {
    const filters: CognitiveFilter[] = [];
    
    const cleanEnvironment = this.cleanTextReference(data.environment);
    const cleanNarrativeDomain = this.cleanTextReference(data.narrativeDomain);

    // Pattern-over-weighting
    filters.push({
      name: "pattern_over_weighting",
      type: "perceptual_bias",
      narrative_description: `Overemphasizes structure and expected symmetry in ${cleanNarrativeDomain} interpretation.`,
      activation_context: `Active in unstable or ambiguous ${cleanEnvironment}.`,
      behavioral_effect: "Rejects valid inputs that don't match internal models.",
      evolution_path: "Can calcify into rigid belief matrices under prolonged exposure."
    });

    // Emotional signal suppression - based on entity type
    const suppressionDescription = data.entityType === 'human' 
      ? "Filters excessive affective content as noise or destabilizer."
      : "Filters affective or emotive content as noise or destabilizer.";
    
    filters.push({
      name: "emotional_signal_suppression",
      type: "response_inhibitor",
      narrative_description: suppressionDescription,
      activation_context: "During high stimulus density or conflict.",
      behavioral_effect: "Flattens tone, disengages from emotionally charged signals.",
      evolution_path: "Could reverse into mimicry if required for survival."
    });

    // Anticipatory contradiction modeling
    filters.push({
      name: "anticipatory_contradiction_modeling",
      type: "conflict_logic",
      narrative_description: "Simulates future inconsistencies before commitment to action.",
      activation_context: "During decision branches or alliance formation.",
      behavioral_effect: data.changeResponseStyle === 'seek_council' 
        ? "Delays commitment, seeks external validation for responses."
        : "Delays commitment, prefers provisional responses.",
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

  // New method to extract physical appearance structure
  static extractPhysicalAppearance(data: CreativeCharacterData): any {
    const description = data.description || '';
    const physicalForm = data.physicalForm || '';
    
    // Parse for non-humanoid characteristics
    if (description.includes('3.8 meters') || description.includes('coil')) {
      return {
        length_meters: 3.8,
        diameter_meters: 0.9,
        composition: 'translucent_coil_with_crystalline_vertebrae',
        emitted_effects: ['amber_pulses', 'vapor_sigils', 'acoustic_distortion'],
        movement_style: 'serpentine_flow',
        material_nature: 'semi_corporeal'
      };
    }
    
    return {
      primary_form: physicalForm || 'undefined',
      composition: 'unknown',
      scale_reference: 'human_scale'
    };
  }
}
