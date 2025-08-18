import { PersonaV2 } from '../../../types/persona-v2';

export class TraitSynthesisEngine {
  /**
   * Generate stance biases based on moral foundations and world values
   */
  generateStanceBiases(persona: PersonaV2): Array<{ topic: string; w: number }> {
    const biases: Array<{ topic: string; w: number }> = [];
    
    // Extract moral foundations
    const moral = persona.cognitive_profile?.moral_foundations;
    if (moral) {
      if (moral.care_harm > 70) biases.push({ topic: "healthcare", w: 0.8 }, { topic: "safety", w: 0.7 });
      if (moral.fairness_cheating > 70) biases.push({ topic: "justice", w: 0.8 }, { topic: "equality", w: 0.7 });
      if (moral.loyalty_betrayal > 70) biases.push({ topic: "family", w: 0.8 }, { topic: "tradition", w: 0.6 });
      if (moral.authority_subversion > 70) biases.push({ topic: "hierarchy", w: 0.7 }, { topic: "respect", w: 0.6 });
      if (moral.sanctity_degradation > 70) biases.push({ topic: "spirituality", w: 0.7 }, { topic: "purity", w: 0.6 });
      if (moral.liberty_oppression > 70) biases.push({ topic: "freedom", w: 0.8 }, { topic: "independence", w: 0.7 });
    }

    // Add occupation-based stances
    const occupation = persona.identity?.occupation;
    if (occupation?.includes("teacher")) biases.push({ topic: "education", w: 0.9 });
    if (occupation?.includes("engineer")) biases.push({ topic: "technology", w: 0.8 });
    if (occupation?.includes("healthcare")) biases.push({ topic: "health", w: 0.9 });

    // Add sexuality-based stances
    const sexuality = persona.sexuality_profile;
    if (sexuality?.value_alignment === "liberal") {
      biases.push({ topic: "lgbtq-rights", w: 0.8 }, { topic: "sexual-freedom", w: 0.7 });
    }

    return biases.slice(0, 12); // limit to most important stances
  }

  /**
   * Generate style probabilities from Big Five and other traits
   */
  generateStyleProbabilities(persona: PersonaV2): {
    hedge_rate: number;
    modal_rate: number;
    definitive_rate: number;
    rhetorical_q_rate: number;
    profanity_rate: number;
  } {
    const bigFive = persona.cognitive_profile?.big_five;
    const sexuality = persona.sexuality_profile;
    
    // Base rates
    let hedgeRate = 0.3;
    let modalRate = 0.2;
    let definitiveRate = 0.4;
    let rhetoricalQRate = 0.1;
    let profanityRate = 0.05;

    if (bigFive) {
      // Agreeableness affects hedging
      hedgeRate += (bigFive.agreeableness - 0.5) * 0.4;
      
      // Conscientiousness affects definitiveness
      definitiveRate += (bigFive.conscientiousness - 0.5) * 0.3;
      
      // Neuroticism affects uncertainty language
      modalRate += (bigFive.neuroticism - 0.5) * 0.3;
      
      // Extraversion affects rhetorical questions
      rhetoricalQRate += (bigFive.extraversion - 0.5) * 0.2;
      
      // Openness affects varied expression
      const opennessFactor = bigFive.openness > 0.7 ? 1.2 : 0.8;
      profanityRate *= opennessFactor;
    }

    // Sexuality expression affects language boldness
    if (sexuality?.expression === "open" || sexuality?.expression === "flamboyant") {
      definitiveRate += 0.1;
      profanityRate += 0.05;
    }

    return {
      hedge_rate: Math.max(0, Math.min(1, hedgeRate)),
      modal_rate: Math.max(0, Math.min(1, modalRate)),
      definitive_rate: Math.max(0, Math.min(1, definitiveRate)),
      rhetorical_q_rate: Math.max(0, Math.min(1, rhetoricalQRate)),
      profanity_rate: Math.max(0, Math.min(0.2, profanityRate))
    };
  }
}