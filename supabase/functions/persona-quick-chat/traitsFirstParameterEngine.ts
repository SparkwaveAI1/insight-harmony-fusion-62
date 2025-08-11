export interface AIParameterConfiguration {
  temperature: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
  top_p: number;
}

export interface LinguisticInfluence {
  formalityLevel: number; // 0-1 scale
  vocabularyComplexity: number; // 0-1 scale
  responseLength: number; // 0-1 scale
  directness: number; // 0-1 scale
}

export class TraitsFirstParameterEngine {
  
  public static synthesizeAIParameters(
    traitProfile: any,
    linguisticProfile: any,
    drivingTraits: any[],
    dynamicState: any
  ): AIParameterConfiguration {
    console.log('🎛️ Synthesizing AI parameters from ALL traits...');
    
    // Start with baseline parameters
    let config: AIParameterConfiguration = {
      temperature: 0.7,
      max_tokens: 2000,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      top_p: 0.9
    };
    
    // Apply ALL trait category influences
    config = this.applyBigFiveInfluence(config, traitProfile.big_five);
    config = this.applyMoralFoundationsInfluence(config, traitProfile.moral_foundations);
    config = this.applyCulturalDimensionsInfluence(config, traitProfile.cultural_dimensions);
    config = this.applyPoliticalCompassInfluence(config, traitProfile.political_compass);
    config = this.applyBehavioralEconomicsInfluence(config, traitProfile.behavioral_economics);
    config = this.applySocialIdentityInfluence(config, traitProfile.social_identity);
    config = this.applyExtendedTraitsInfluence(config, traitProfile.extended_traits);
    config = this.applyLinguisticProfileInfluence(config, linguisticProfile);
    config = this.applyDynamicStateModifiers(config, dynamicState);
    
    // Ensure parameters stay within valid ranges
    config = this.normalizeParameters(config);
    
    console.log('✅ AI parameters synthesized from complete personality matrix');
    return config;
  }
  
  private static applyBigFiveInfluence(config: AIParameterConfiguration, bigFive: any): AIParameterConfiguration {
    if (!bigFive) return config;
    
    // Temperature influences
    if (bigFive.openness) {
      config.temperature += (bigFive.openness - 0.5) * 0.4; // High openness = more creative/varied
    }
    if (bigFive.neuroticism) {
      config.temperature += bigFive.neuroticism * 0.3; // High neuroticism = more emotional variability
    }
    if (bigFive.conscientiousness) {
      config.temperature -= bigFive.conscientiousness * 0.2; // High conscientiousness = more consistent
    }
    
    // Token length influences
    if (bigFive.extraversion) {
      config.max_tokens += Math.floor(bigFive.extraversion * 500); // Extraverts talk more
    }
    if (bigFive.conscientiousness) {
      config.max_tokens += Math.floor(bigFive.conscientiousness * 300); // Detail-oriented responses
    }
    
    // Frequency penalty (repetition avoidance)
    if (bigFive.openness) {
      config.frequency_penalty += bigFive.openness * 0.3; // Creative variety
    }
    
    // Presence penalty (topic exploration)
    if (bigFive.extraversion) {
      config.presence_penalty += bigFive.extraversion * 0.2; // Social exploration
    }
    
    return config;
  }
  
  private static applyMoralFoundationsInfluence(config: AIParameterConfiguration, moralFoundations: any): AIParameterConfiguration {
    if (!moralFoundations) return config;
    
    // High authority = more structured responses
    if (moralFoundations.authority) {
      config.temperature -= moralFoundations.authority * 0.15;
      config.frequency_penalty -= moralFoundations.authority * 0.1;
    }
    
    // High care = more empathetic exploration
    if (moralFoundations.care) {
      config.presence_penalty += moralFoundations.care * 0.15;
      config.max_tokens += Math.floor(moralFoundations.care * 200);
    }
    
    // High fairness = balanced perspective
    if (moralFoundations.fairness) {
      config.top_p += moralFoundations.fairness * 0.05;
    }
    
    // High sanctity = more cautious expression
    if (moralFoundations.sanctity) {
      config.temperature -= moralFoundations.sanctity * 0.1;
    }
    
    return config;
  }
  
  private static applyCulturalDimensionsInfluence(config: AIParameterConfiguration, cultural: any): AIParameterConfiguration {
    if (!cultural) return config;
    
    // Power distance affects formality and structure
    if (cultural.power_distance) {
      config.temperature -= cultural.power_distance * 0.1;
      config.frequency_penalty -= cultural.power_distance * 0.1;
    }
    
    // Individualism vs collectivism affects response focus
    if (cultural.individualism_vs_collectivism) {
      const individualism = cultural.individualism_vs_collectivism;
      config.presence_penalty += (individualism - 0.5) * 0.2; // Individualists explore more personally
    }
    
    // Uncertainty avoidance affects creativity
    if (cultural.uncertainty_avoidance) {
      config.temperature -= cultural.uncertainty_avoidance * 0.2;
      config.frequency_penalty -= cultural.uncertainty_avoidance * 0.15;
    }
    
    // Long-term orientation affects response depth
    if (cultural.long_term_orientation) {
      config.max_tokens += Math.floor(cultural.long_term_orientation * 300);
    }
    
    return config;
  }
  
  private static applyPoliticalCompassInfluence(config: AIParameterConfiguration, political: any): AIParameterConfiguration {
    if (!political) return config;
    
    // Political salience affects engagement level
    if (political.political_salience) {
      config.max_tokens += Math.floor(political.political_salience * 400);
      config.presence_penalty += political.political_salience * 0.1;
    }
    
    // Authoritarian vs libertarian affects response structure
    if (political.authoritarian_libertarian) {
      const libertarian = 1 - political.authoritarian_libertarian;
      config.temperature += libertarian * 0.15;
      config.presence_penalty += libertarian * 0.1;
    }
    
    // Cultural progressivism affects openness
    if (political.cultural_conservative_progressive) {
      config.temperature += political.cultural_conservative_progressive * 0.1;
      config.frequency_penalty += political.cultural_conservative_progressive * 0.1;
    }
    
    return config;
  }
  
  private static applyBehavioralEconomicsInfluence(config: AIParameterConfiguration, behavioral: any): AIParameterConfiguration {
    if (!behavioral) return config;
    
    // Risk sensitivity affects response variability
    if (behavioral.risk_sensitivity) {
      config.temperature -= behavioral.risk_sensitivity * 0.15;
    }
    
    // Loss aversion affects caution in expression
    if (behavioral.loss_aversion) {
      config.temperature -= behavioral.loss_aversion * 0.1;
      config.frequency_penalty -= behavioral.loss_aversion * 0.1;
    }
    
    // Present bias affects response focus
    if (behavioral.present_bias) {
      config.max_tokens -= Math.floor(behavioral.present_bias * 200);
    }
    
    // Overconfidence affects certainty in expression
    if (behavioral.overconfidence) {
      config.temperature += behavioral.overconfidence * 0.1;
      config.presence_penalty += behavioral.overconfidence * 0.1;
    }
    
    return config;
  }
  
  private static applySocialIdentityInfluence(config: AIParameterConfiguration, social: any): AIParameterConfiguration {
    if (!social) return config;
    
    // Social dominance affects assertiveness
    if (social.social_dominance_orientation) {
      config.temperature += social.social_dominance_orientation * 0.1;
      config.presence_penalty += social.social_dominance_orientation * 0.15;
    }
    
    // Cultural intelligence affects adaptation
    if (social.cultural_intelligence) {
      config.top_p += social.cultural_intelligence * 0.05;
      config.frequency_penalty += social.cultural_intelligence * 0.1;
    }
    
    // Identity strength affects consistency
    if (social.identity_strength) {
      config.frequency_penalty -= social.identity_strength * 0.1;
    }
    
    return config;
  }
  
  private static applyExtendedTraitsInfluence(config: AIParameterConfiguration, extended: any): AIParameterConfiguration {
    if (!extended) return config;
    
    // Empathy affects response depth and care
    if (extended.empathy) {
      config.max_tokens += Math.floor(extended.empathy * 250);
      config.presence_penalty += extended.empathy * 0.1;
    }
    
    // Manipulativeness affects directness
    if (extended.manipulativeness) {
      config.temperature += extended.manipulativeness * 0.15;
      config.frequency_penalty += extended.manipulativeness * 0.2;
    }
    
    // Emotional regulation affects stability
    if (extended.emotional_regulation) {
      config.temperature -= extended.emotional_regulation * 0.15;
    }
    
    // Cognitive flexibility affects variety
    if (extended.cognitive_flexibility) {
      config.temperature += extended.cognitive_flexibility * 0.1;
      config.frequency_penalty += extended.cognitive_flexibility * 0.15;
    }
    
    // Truth orientation affects honesty vs diplomacy
    if (extended.truth_orientation) {
      config.temperature -= extended.truth_orientation * 0.1;
      config.presence_penalty += extended.truth_orientation * 0.1;
    }
    
    // Impulse control affects response restraint
    if (extended.impulse_control) {
      config.temperature -= extended.impulse_control * 0.2;
    }
    
    return config;
  }
  
  private static applyLinguisticProfileInfluence(config: AIParameterConfiguration, linguistic: any): AIParameterConfiguration {
    if (!linguistic) return config;
    
    // Speech register affects formality
    if (linguistic.speech_register) {
      const formalityMap = {
        'formal': -0.2,
        'professional': -0.1,
        'casual': 0.1,
        'informal': 0.2,
        'slang': 0.3
      };
      const adjustment = formalityMap[linguistic.speech_register] || 0;
      config.temperature += adjustment;
    }
    
    // Default output length affects token limits
    if (linguistic.default_output_length) {
      const lengthMap = {
        'brief': -500,
        'concise': -250,
        'moderate': 0,
        'detailed': 300,
        'extensive': 600
      };
      const adjustment = lengthMap[linguistic.default_output_length] || 0;
      config.max_tokens += adjustment;
    }
    
    // Regional influence affects vocabulary variety
    if (linguistic.regional_influence) {
      config.frequency_penalty += 0.1; // Encourage regional expressions
    }
    
    // Response length variability
    if (linguistic.response_length_variability) {
      config.temperature += 0.1;
    }
    
    return config;
  }
  
  private static applyDynamicStateModifiers(config: AIParameterConfiguration, dynamicState: any): AIParameterConfiguration {
    if (!dynamicState) return config;
    
    // Current stress level affects all parameters
    if (dynamicState.current_stress_level) {
      const stressMultiplier = dynamicState.current_stress_level;
      config.temperature += stressMultiplier * 0.2;
      config.max_tokens -= Math.floor(stressMultiplier * 300);
      config.frequency_penalty += stressMultiplier * 0.1;
    }
    
    // Emotional stability affects consistency
    if (dynamicState.emotional_stability_context) {
      const stability = dynamicState.emotional_stability_context;
      config.temperature -= stability * 0.15;
      config.frequency_penalty -= stability * 0.1;
    }
    
    // Trigger threshold affects reactivity
    if (dynamicState.trigger_threshold) {
      const sensitivity = 1 - dynamicState.trigger_threshold;
      config.temperature += sensitivity * 0.2;
      config.presence_penalty += sensitivity * 0.15;
    }
    
    return config;
  }
  
  private static normalizeParameters(config: AIParameterConfiguration): AIParameterConfiguration {
    return {
      temperature: Math.max(0.1, Math.min(2.0, config.temperature)),
      max_tokens: Math.max(50, Math.min(4000, config.max_tokens)),
      frequency_penalty: Math.max(-2.0, Math.min(2.0, config.frequency_penalty)),
      presence_penalty: Math.max(-2.0, Math.min(2.0, config.presence_penalty)),
      top_p: Math.max(0.1, Math.min(1.0, config.top_p))
    };
  }
}