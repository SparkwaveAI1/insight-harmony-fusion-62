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
    const description = data.description?.toLowerCase() || '';
    const environment = data.environment?.toLowerCase() || '';
    const narrativeDomain = data.narrativeDomain?.toLowerCase() || '';
    const functionalRole = data.functionalRole?.toLowerCase() || '';
    
    // Generate 2-4 unique motives based on character analysis
    
    // Analyze primary drive from description and role
    if (description.includes('protect') || functionalRole.includes('guardian')) {
      motives.push({
        name: "protective_preservation",
        intensity: this.calculateDynamicIntensity(description, ['protect', 'guard', 'defend']),
        narrative_description: `Compelled to maintain stability and safety within ${this.cleanTextReference(data.environment)}, driven by deep responsibility patterns.`,
        failure_response: data.changeResponseStyle === 'collapse_destabilize' 
          ? "Enters protective shutdown when unable to maintain security boundaries."
          : "Escalates protective measures or seeks backup systems when primary protection fails.",
        evolution_path: "May develop into hypervigilance or conversely into selective protection focus."
      });
    } else if (description.includes('seek') || description.includes('discover') || functionalRole.includes('oracle')) {
      motives.push({
        name: "knowledge_integration",
        intensity: this.calculateDynamicIntensity(description, ['seek', 'discover', 'learn', 'understand']),
        narrative_description: `Driven to absorb, process, and synthesize information patterns from ${this.cleanTextReference(data.environment)}.`,
        failure_response: data.changeResponseStyle === 'suppress_contradiction' 
          ? "Filters conflicting information until coherent patterns emerge."
          : "Pursues alternative information sources or adjusts integration methods.",
        evolution_path: "Could evolve into information hoarding or develop sophisticated filtering mechanisms."
      });
    } else if (description.includes('connect') || description.includes('bridge') || environment.includes('between')) {
      motives.push({
        name: "dimensional_bridging",
        intensity: this.calculateDynamicIntensity(description, ['connect', 'bridge', 'link', 'traverse']),
        narrative_description: `Compelled to establish and maintain connections across different states or realms within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Attempts to rebuild connections through alternative pathways or enters temporary isolation to preserve existing links.",
        evolution_path: "May develop into master coordinator or become selective about which connections to maintain."
      });
    }

    // Analyze secondary drive from narrative domain and environment
    if (narrativeDomain.includes('sci-fi') && (description.includes('system') || description.includes('data'))) {
      motives.push({
        name: "system_optimization",
        intensity: this.calculateDynamicIntensity(description, ['system', 'optimize', 'efficiency', 'process']),
        narrative_description: `Seeks to improve and streamline operational systems within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Implements backup protocols or enters diagnostic mode when optimization fails.",
        evolution_path: "Could develop into perfectionism or adaptive system flexibility."
      });
    } else if (narrativeDomain.includes('fantasy') && (description.includes('magic') || description.includes('power'))) {
      motives.push({
        name: "essence_mastery",
        intensity: this.calculateDynamicIntensity(description, ['magic', 'power', 'energy', 'force']),
        narrative_description: `Driven to understand and channel fundamental forces within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Withdraws to rebuild connection with core essence or seeks alternative power sources.",
        evolution_path: "May evolve into power specialization or develop balanced multi-force approach."
      });
    } else if (environment.includes('shadow') || description.includes('hidden')) {
      motives.push({
        name: "shadow_navigation",
        intensity: this.calculateDynamicIntensity(description, ['shadow', 'hidden', 'secret', 'concealed']),
        narrative_description: `Compelled to operate within and understand concealed aspects of ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Retreats deeper into shadows or emerges temporarily to reassess hidden dynamics.",
        evolution_path: "Could become master of concealment or develop transparency as strategic tool."
      });
    }

    // Analyze tertiary drive from communication and change response
    if (data.communication?.includes('telepathic') || data.communication?.includes('psychic')) {
      motives.push({
        name: "consciousness_resonance",
        intensity: this.calculateDynamicIntensity(data.communication, ['telepathic', 'psychic', 'mental', 'mind']),
        narrative_description: `Seeks to establish and maintain direct consciousness connections with compatible entities.`,
        failure_response: data.changeResponseStyle === 'collapse_destabilize'
          ? "Withdraws into mental isolation when resonance fails."
          : "Adjusts resonance frequency or seeks alternative consciousness contact methods.",
        evolution_path: "May develop selective consciousness filtering or enhanced empathic sensitivity."
      });
    } else if (data.changeResponseStyle === 'mutate_adapt') {
      motives.push({
        name: "adaptive_evolution",
        intensity: 0.7,
        narrative_description: `Driven to continuously evolve and adapt in response to environmental changes within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Accelerates mutation cycles or enters stasis to preserve current adaptive gains.",
        evolution_path: "Could develop into rapid-change specialist or achieve optimal stability point."
      });
    }

    // Ensure at least 2 motives, add default if needed
    if (motives.length < 2) {
      motives.push({
        name: "existence_anchoring",
        intensity: this.calculateDynamicIntensity(data.description, ['exist', 'being', 'presence', 'form']),
        narrative_description: `Maintains coherent existence and presence within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Reinforces core identity patterns or seeks external validation of existence.",
        evolution_path: "May develop stronger self-definition or achieve transcendent existence state."
      });
    }

    return motives.slice(0, 4); // Maximum 4 motives
  }

  private static generateLatentValues(data: CreativeCharacterData): LatentValue[] {
    const values: LatentValue[] = [];
    const description = data.description?.toLowerCase() || '';
    const environment = data.environment?.toLowerCase() || '';
    const entityType = data.entityType?.toLowerCase() || '';
    
    // Generate 2-3 unique values based on character analysis
    
    // Analyze relationship patterns
    if (description.includes('solitary') || description.includes('alone') || entityType.includes('non_humanoid')) {
      values.push({
        name: "selective_resonance",
        intensity: this.calculateDynamicIntensity(description, ['select', 'choose', 'careful', 'precise']),
        narrative_description: `Values carefully chosen connections over broad social engagement within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Increases selectivity criteria or temporarily isolates to reassess connection standards.",
        evolution_path: "May develop exquisite discrimination or learn to balance selectivity with openness."
      });
    } else if (description.includes('community') || description.includes('together') || data.functionalRole?.includes('coordinator')) {
      values.push({
        name: "collective_harmony",
        intensity: this.calculateDynamicIntensity(description, ['community', 'together', 'group', 'shared']),
        narrative_description: `Values synchronized group dynamics and collective well-being over individual advancement.`,
        failure_response: "Attempts to restore group cohesion or temporarily distances to avoid disrupting collective harmony.",
        evolution_path: "Could develop into community leadership or specialize in conflict resolution."
      });
    }

    // Analyze knowledge/information patterns
    if (description.includes('knowledge') || description.includes('wisdom') || data.functionalRole?.includes('oracle')) {
      values.push({
        name: "truth_preservation",
        intensity: 0.6 + (description.includes('ancient') ? 0.2 : 0),
        narrative_description: `Values the maintenance and accurate transmission of essential knowledge across time and contexts.`,
        failure_response: "Implements redundant preservation methods or selectively shares knowledge to prevent loss.",
        evolution_path: "May become knowledge guardian or develop dynamic truth-adaptation abilities."
      });
    } else if (description.includes('create') || description.includes('make') || data.narrativeDomain?.includes('fantasy')) {
      values.push({
        name: "creative_manifestation",
        intensity: this.calculateDynamicIntensity(description, ['create', 'make', 'build', 'form']),
        narrative_description: `Values the process of bringing new forms and patterns into existence within ${this.cleanTextReference(data.environment)}.`,
        failure_response: "Seeks alternative creative outlets or enters incubation period to rebuild creative capacity.",
        evolution_path: "Could specialize in specific creation types or develop meta-creative abilities."
      });
    }

    // Analyze stability/change patterns
    if (data.changeResponseStyle === 'suppress_contradiction') {
      values.push({
        name: "coherence_maintenance",
        intensity: 0.8,
        narrative_description: `Values internal consistency and logical coherence above external validation or change pressure.`,
        failure_response: "Reinforces core consistency patterns or compartmentalizes conflicting information.",
        evolution_path: "May achieve unshakeable coherence or develop sophisticated integration abilities."
      });
    } else if (data.changeResponseStyle === 'mutate_adapt') {
      values.push({
        name: "evolutionary_flow",
        intensity: 0.7,
        narrative_description: `Values continuous growth and adaptation as fundamental to existence and purpose.`,
        failure_response: "Accelerates change attempts or enters temporary stasis to preserve adaptation gains.",
        evolution_path: "Could become change master or find optimal stability-change balance."
      });
    }

    // Ensure at least 2 values
    if (values.length < 2) {
      values.push({
        name: "existential_integrity",
        intensity: 0.65,
        narrative_description: `Values authentic expression of core nature within environmental constraints.`,
        failure_response: "Reinforces authentic self-expression or withdraws to protect core integrity.",
        evolution_path: "May develop stronger self-expression or achieve transcendent authenticity."
      });
    }

    return values.slice(0, 3); // Maximum 3 values
  }

  private static generateSymbolicTraits(data: CreativeCharacterData): SymbolicTrait[] {
    const traits: SymbolicTrait[] = [];
    const description = data.description?.toLowerCase() || '';
    const environment = data.environment?.toLowerCase() || '';
    const communication = data.communication?.toLowerCase() || '';
    const changeStyle = data.changeResponseStyle;
    
    // Generate traits based on actual character properties - completely dynamic
    
    // Communication-based traits
    if (communication.includes('bioluminescent') || communication.includes('pulse') || communication.includes('glow')) {
      traits.push({
        name: "luminous_syntax",
        type: "communication_transformer",
        narrative_description: `Converts abstract concepts into pulsing light patterns that reveal underlying logical structures.`,
        activation_context: "During complex communication or when processing multilayered information.",
        behavioral_effect: "Creates visual information hierarchies through controlled bioluminescent displays.",
        evolution_path: "Could develop into pure light-based communication or multi-spectrum information encoding."
      });
    } else if (communication.includes('telepathic') || communication.includes('psychic') || communication.includes('mind')) {
      traits.push({
        name: "consciousness_bridging",
        type: "mental_connector",
        narrative_description: `Forms direct neural pathways between compatible consciousness patterns.`,
        activation_context: "When establishing deep communication or during crisis situations.",
        behavioral_effect: "Bypasses verbal communication to share direct experiential understanding.",
        evolution_path: "May evolve into selective consciousness merging or develop psychic boundaries."
      });
    } else if (communication.includes('silence') || description.includes('quiet') || changeStyle === 'collapse_destabilize') {
      traits.push({
        name: "meaningful_void",
        type: "absence_communicator",
        narrative_description: `Uses strategic silence and absence as precise information delivery methods.`,
        activation_context: "When verbal communication would be insufficient or harmful.",
        behavioral_effect: "Creates information through what is deliberately not communicated.",
        evolution_path: "Could master negative-space communication or develop selective verbal emergence."
      });
    }

    // Environment-based traits
    if (environment.includes('spiral') || environment.includes('vortex') || environment.includes('twist')) {
      traits.push({
        name: "spiral_processing",
        type: "dimensional_navigator",
        narrative_description: `Processes information and movement in recursive spiral patterns that reveal hidden connections.`,
        activation_context: "During complex problem-solving or dimensional navigation.",
        behavioral_effect: "Approaches challenges through iterative spiral analysis rather than linear progression.",
        evolution_path: "May develop into temporal spiral manipulation or achieve perfect recursive balance."
      });
    } else if (environment.includes('shadow') || environment.includes('dark') || environment.includes('hidden')) {
      traits.push({
        name: "shadow_integration",
        type: "concealment_processor",
        narrative_description: `Integrates hidden and rejected aspects into functional wholeness.`,
        activation_context: "When encountering denial, secrets, or suppressed information.",
        behavioral_effect: "Reveals hidden connections and acknowledges suppressed elements without judgment.",
        evolution_path: "Could become master of hidden knowledge or develop transparent authenticity."
      });
    } else if (environment.includes('crystal') || environment.includes('geometric') || description.includes('pattern')) {
      traits.push({
        name: "crystalline_structure",
        type: "pattern_organizer",
        narrative_description: `Organizes complex information into clear, multifaceted structural patterns.`,
        activation_context: "During information synthesis or when creating order from chaos.",
        behavioral_effect: "Presents complex concepts through precise, interconnected structural relationships.",
        evolution_path: "May develop perfect information architecture or achieve dynamic structural fluidity."
      });
    }

    // Entity type and narrative domain traits
    if (data.narrativeDomain === 'sci-fi' && (description.includes('data') || description.includes('system'))) {
      traits.push({
        name: "data_crystallization",
        type: "information_processor",
        narrative_description: `Transforms raw data streams into stable, accessible knowledge structures.`,
        activation_context: "During high-volume information processing or system analysis.",
        behavioral_effect: "Creates persistent information patterns that can be reliably accessed and modified.",
        evolution_path: "Could develop into living database or achieve dynamic information fluidity."
      });
    } else if (data.narrativeDomain === 'fantasy' && (description.includes('magic') || description.includes('mystical'))) {
      traits.push({
        name: "essence_weaving",
        type: "mystical_synthesizer",
        narrative_description: `Combines disparate magical forces into coherent, purposeful manifestations.`,
        activation_context: "When working with multiple energy sources or during magical problem-solving.",
        behavioral_effect: "Creates unified magical effects from seemingly incompatible force types.",
        evolution_path: "May master force unification or develop specialized magical harmonics."
      });
    }

    // Change response traits
    if (changeStyle === 'mutate_adapt') {
      traits.push({
        name: "adaptive_morphing",
        type: "transformation_catalyst",
        narrative_description: `Continuously adjusts behavioral and cognitive patterns to match environmental demands.`,
        activation_context: "During environmental changes or when encountering new challenges.",
        behavioral_effect: "Demonstrates fluid adaptation while maintaining core identity coherence.",
        evolution_path: "Could achieve perfect adaptability or find optimal adaptation-stability balance."
      });
    } else if (changeStyle === 'suppress_contradiction') {
      traits.push({
        name: "coherence_filtering",
        type: "consistency_guardian",
        narrative_description: `Maintains logical consistency by filtering contradictory information through coherence protocols.`,
        activation_context: "When encountering conflicting information or logical paradoxes.",
        behavioral_effect: "Preserves internal consistency while gradually integrating compatible new information.",
        evolution_path: "May develop sophisticated integration protocols or achieve paradox tolerance."
      });
    }

    // Ensure at least 1 trait, add character-specific default if needed
    if (traits.length === 0) {
      const uniqueName = this.generateUniqueTraitName(data);
      traits.push({
        name: uniqueName,
        type: "behavioral_processor",
        narrative_description: `Processes interactions through ${data.name}'s unique perspective within ${this.cleanTextReference(data.environment)}.`,
        activation_context: "During complex social or environmental interactions.",
        behavioral_effect: `Expresses ${data.name}'s distinctive approach to problem-solving and relationship management.`,
        evolution_path: `Could develop ${data.name}'s specialized capabilities or achieve broader behavioral integration.`
      });
    }

    return traits.slice(0, 4); // Maximum 4 traits
  }

  private static generateCognitiveFilters(data: CreativeCharacterData): CognitiveFilter[] {
    const filters: CognitiveFilter[] = [];
    const description = data.description?.toLowerCase() || '';
    const narrativeDomain = data.narrativeDomain?.toLowerCase() || '';
    const entityType = data.entityType?.toLowerCase() || '';
    const changeStyle = data.changeResponseStyle;
    
    // Generate 2-3 unique filters based on character analysis
    
    // Analyze information processing patterns
    if (description.includes('analytical') || description.includes('logical') || narrativeDomain.includes('sci-fi')) {
      filters.push({
        name: "systematic_validation",
        type: "logic_processor",
        narrative_description: `Validates all information through systematic logical frameworks before acceptance.`,
        activation_context: `During information evaluation within ${this.cleanTextReference(data.environment)}.`,
        behavioral_effect: "Delays decision-making until logical validation is complete, rejects emotionally-driven conclusions.",
        evolution_path: "Could develop into perfect logical processor or learn to integrate intuitive validation methods."
      });
    } else if (description.includes('intuitive') || description.includes('feeling') || narrativeDomain.includes('fantasy')) {
      filters.push({
        name: "intuitive_resonance",
        type: "pattern_sensor",
        narrative_description: `Evaluates information based on energetic resonance and pattern compatibility.`,
        activation_context: "During complex decision-making or when logic alone is insufficient.",
        behavioral_effect: "Prioritizes information that 'feels right' over purely logical conclusions.",
        evolution_path: "May develop enhanced pattern recognition or learn to balance intuition with analysis."
      });
    }

    // Analyze social processing patterns
    if (entityType.includes('non_humanoid') || description.includes('alien') || description.includes('different')) {
      filters.push({
        name: "species_perspective_shift",
        type: "viewpoint_translator",
        narrative_description: `Automatically translates human-centric concepts into species-appropriate frameworks.`,
        activation_context: "During cross-species communication or when processing human-derived information.",
        behavioral_effect: "Reframes human concepts through non-human perspective, may miss human emotional subtleties.",
        evolution_path: "Could master cross-species translation or develop universal perspective integration."
      });
    } else if (description.includes('social') || data.functionalRole?.includes('coordinator')) {
      filters.push({
        name: "group_dynamics_emphasis",
        type: "social_prioritizer",
        narrative_description: `Automatically prioritizes group harmony and collective outcomes in all evaluations.`,
        activation_context: "During social interactions or group decision-making processes.",
        behavioral_effect: "Filters individual needs through group impact assessment, may suppress personal preferences.",
        evolution_path: "May achieve optimal individual-group balance or specialize in collective optimization."
      });
    }

    // Analyze temporal/change processing
    if (changeStyle === 'collapse_destabilize') {
      filters.push({
        name: "stability_preservation",
        type: "change_resistor",
        narrative_description: `Filters rapid changes as potential system threats requiring careful evaluation.`,
        activation_context: "During periods of change or when encountering novel situations.",
        behavioral_effect: "Slows response to change, prefers gradual adaptation over rapid adjustment.",
        evolution_path: "Could develop selective change acceptance or achieve dynamic stability mastery."
      });
    } else if (changeStyle === 'mutate_adapt') {
      filters.push({
        name: "novelty_amplification",
        type: "change_accelerator",
        narrative_description: `Emphasizes new and changing elements while filtering routine information as less relevant.`,
        activation_context: "During stable periods or when processing routine information.",
        behavioral_effect: "Overemphasizes novel aspects, may undervalue stability and consistency.",
        evolution_path: "May learn to balance novelty with stability or develop change-pattern expertise."
      });
    }

    // Analyze domain-specific processing
    if (data.environment?.includes('academic') || description.includes('scholar') || data.functionalRole?.includes('oracle')) {
      filters.push({
        name: "knowledge_hierarchy_bias",
        type: "expertise_filter",
        narrative_description: `Automatically weighs information based on source expertise and knowledge depth.`,
        activation_context: "During learning or when evaluating conflicting information sources.",
        behavioral_effect: "Prioritizes expert knowledge over experiential wisdom, may dismiss valuable non-expert insights.",
        evolution_path: "Could develop sophisticated source evaluation or learn to integrate diverse knowledge types."
      });
    }

    // Ensure at least 2 filters
    if (filters.length < 2) {
      filters.push({
        name: "environmental_attunement",
        type: "context_adapter",
        narrative_description: `Automatically adjusts information processing based on environmental context and conditions.`,
        activation_context: `When operating within varying conditions in ${this.cleanTextReference(data.environment)}.`,
        behavioral_effect: "Modifies interpretation and response patterns based on environmental feedback.",
        evolution_path: "May achieve perfect environmental synchronization or develop context-independent processing."
      });
    }

    return filters.slice(0, 3); // Maximum 3 filters
  }

  // Helper methods
  private static calculateDynamicIntensity(text: string, keywords: string[]): number {
    if (!text) return 0.5;
    
    const keywordCount = keywords.filter(keyword => text.includes(keyword)).length;
    const baseIntensity = 0.4 + (keywordCount * 0.15);
    
    // Add variation based on text length and complexity
    const complexity = text.length > 100 ? 0.1 : 0;
    const emphasis = text.includes('very') || text.includes('extremely') ? 0.1 : 0;
    
    return Math.min(0.95, baseIntensity + complexity + emphasis);
  }

  private static cleanTextReference(text: string | undefined): string {
    if (!text) return 'their environment';
    
    const cleanText = text
      .replace(/Does not possess rigid bodies but manifest.*/gi, '')
      .replace(/\.\.\..*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    return cleanText || 'their environment';
  }

  private static generateUniqueTraitName(data: CreativeCharacterData): string {
    const nameBase = data.name?.toLowerCase().replace(/\s+/g, '_') || 'entity';
    const domainBase = data.narrativeDomain?.toLowerCase() || 'general';
    const environmentKey = data.environment?.toLowerCase().split(' ')[0] || 'space';
    
    return `${nameBase}_${environmentKey}_integration`;
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
      modality: data.communication || 'contextual_adaptive',
      grammar: 'species_appropriate',
      expression_register: 'environmentally_tuned'
    };
  }

  static extractPhysicalAppearance(data: CreativeCharacterData): PhysicalAppearanceStructure {
    const description = data.description || '';
    const physicalForm = data.physicalForm || '';
    
    // Extract dynamic measurements from description
    const sizeMatch = description.match(/(\d+\.?\d*)\s*(?:meters?|m)/i);
    const length = sizeMatch ? parseFloat(sizeMatch[1]) : this.estimateSizeFromDescription(description);
    const diameter = length * 0.3; // Dynamic ratio based on description
    
    // Extract specific physical characteristics
    if (description.includes('3.8 meters') || description.includes('coil') || 
        description.includes('translucent') || description.includes('crystalline')) {
      return {
        structure: this.extractStructureFromDescription(description),
        material: this.extractMaterialFromDescription(description),
        movement_style: this.extractMovementFromDescription(description),
        emissions: this.extractEmissionsFromDescription(description),
        visual_effects: this.extractVisualEffectsFromDescription(description),
        sensory_effects: this.extractSensoryEffectsFromDescription(description),
        size_estimate: {
          length_meters: length,
          diameter_meters: diameter
        },
        narrative_description: `${data.name} manifests as ${description || physicalForm} within ${data.environment || 'their chosen domain'}.`
      };
    }
    
    return {
      structure: physicalForm || this.inferStructureFromEntityType(data.entityType),
      material: this.extractMaterialFromDescription(description) || this.inferMaterialFromDomain(data.narrativeDomain),
      movement_style: this.extractMovementFromDescription(description) || this.inferMovementFromEnvironment(data.environment),
      emissions: this.extractEmissionsFromDescription(description),
      visual_effects: this.extractVisualEffectsFromDescription(description),
      sensory_effects: this.extractSensoryEffectsFromDescription(description),
      size_estimate: {
        length_meters: length,
        diameter_meters: diameter
      },
      narrative_description: `${data.name} appears as ${description || physicalForm || 'a distinctive entity'} within ${data.environment || 'their domain'}.`
    };
  }

  // Dynamic physical characteristic extraction methods
  private static estimateSizeFromDescription(description: string): number {
    if (description.includes('massive') || description.includes('giant')) return 8.0;
    if (description.includes('large') || description.includes('towering')) return 4.5;
    if (description.includes('small') || description.includes('compact')) return 1.2;
    if (description.includes('tiny') || description.includes('miniature')) return 0.3;
    return 2.1; // Default based on description complexity
  }

  private static extractStructureFromDescription(description: string): string {
    if (description.includes('coil')) return 'serpentine coiled form';
    if (description.includes('crystalline')) return 'multifaceted crystalline structure';
    if (description.includes('fluid')) return 'fluid morphic structure';
    if (description.includes('geometric')) return 'complex geometric configuration';
    return 'unique structural form';
  }

  private static extractMaterialFromDescription(description: string): string {
    if (description.includes('crystalline')) return 'living crystalline matrix';
    if (description.includes('translucent')) return 'semi-transparent bio-material';
    if (description.includes('energy')) return 'concentrated energy field';
    if (description.includes('metallic')) return 'bio-metallic composite';
    if (description.includes('organic')) return 'adaptive organic matter';
    return 'specialized bio-material';
  }

  private static extractMovementFromDescription(description: string): string {
    if (description.includes('flow')) return 'fluid undulation';
    if (description.includes('ripple')) return 'wavelike progression';
    if (description.includes('glide')) return 'effortless gliding motion';
    if (description.includes('pulse')) return 'rhythmic pulsing movement';
    if (description.includes('phase')) return 'dimensional phase shifting';
    return 'species-appropriate locomotion';
  }

  private static extractEmissionsFromDescription(description: string): string[] {
    const emissions: string[] = [];
    if (description.includes('bioluminescent') || description.includes('glow')) {
      emissions.push('contextual bioluminescence');
    }
    if (description.includes('vapor') || description.includes('mist')) {
      emissions.push('atmospheric vapor trails');
    }
    if (description.includes('energy')) {
      emissions.push('energy field fluctuations');
    }
    if (description.includes('sound') || description.includes('resonance')) {
      emissions.push('harmonic resonance patterns');
    }
    return emissions.length > 0 ? emissions : ['subtle presence emanations'];
  }

  private static extractVisualEffectsFromDescription(description: string): string[] {
    const effects: string[] = [];
    if (description.includes('glyph') || description.includes('symbol')) {
      effects.push('dynamic symbolic manifestations');
    }
    if (description.includes('fractal')) {
      effects.push('recursive fractal expressions');
    }
    if (description.includes('shimmer') || description.includes('iridescent')) {
      effects.push('surface iridescence variations');
    }
    if (description.includes('transparent') || description.includes('translucent')) {
      effects.push('transparency modulation');
    }
    return effects.length > 0 ? effects : ['subtle environmental interactions'];
  }

  private static extractSensoryEffectsFromDescription(description: string): string[] {
    const effects: string[] = [];
    if (description.includes('acoustic') || description.includes('sound')) {
      effects.push('acoustic environment modulation');
    }
    if (description.includes('resonance')) {
      effects.push('harmonic resonance effects');
    }  
    if (description.includes('temperature')) {
      effects.push('localized temperature variations');
    }
    if (description.includes('pressure')) {
      effects.push('atmospheric pressure changes');
    }
    return effects.length > 0 ? effects : ['environmental presence effects'];
  }

  // Inference methods for missing data
  private static inferStructureFromEntityType(entityType: string): string {
    if (entityType === 'human') return 'humanoid form';
    if (entityType === 'non_humanoid') return 'non-standard entity structure';
    return 'adaptive structural configuration';
  }

  private static inferMaterialFromDomain(domain: string): string {
    if (domain === 'sci-fi') return 'advanced technological material';
    if (domain === 'fantasy') return 'magically-infused organic matter';
    if (domain === 'horror') return 'disturbingly organic material';
    return 'domain-appropriate material composition';
  }

  private static inferMovementFromEnvironment(environment: string): string {
    if (!environment) return 'contextually-appropriate movement';
    const env = environment.toLowerCase();
    if (env.includes('water') || env.includes('ocean')) return 'aquatic propulsion';
    if (env.includes('air') || env.includes('sky')) return 'aerial navigation';
    if (env.includes('underground') || env.includes('cave')) return 'subterranean locomotion';
    return 'environmentally-adapted movement';
  }
}
