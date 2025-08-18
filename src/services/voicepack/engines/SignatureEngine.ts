import { PersonaV2 } from '../../../types/persona-v2';

export class SignatureEngine {
  /**
   * Compile anti-mode-collapse system
   */
  async compileAntiModeCollapse(persona: PersonaV2) {
    // Extract forbidden frames from PersonaV2
    const baseForbiddenFrames = persona.linguistic_style?.anti_mode_collapse?.forbidden_frames || [
      "It's clear what this is about",
      "Overall pretty solid", 
      "At the end of the day"
    ];

    // Add personality-specific forbidden frames
    const forbiddenFrames = [...baseForbiddenFrames];
    
    // High agreeableness - avoid overly confrontational language
    const agreeableness = persona.cognitive_profile?.big_five?.agreeableness || 0.5;
    if (agreeableness > 0.7) {
      forbiddenFrames.push("You're completely wrong", "That's ridiculous", "Obviously you don't understand");
    }

    // Low openness - avoid overly abstract language
    const openness = persona.cognitive_profile?.big_five?.openness || 0.5;
    if (openness < 0.3) {
      forbiddenFrames.push("It's a complex paradigm", "The multifaceted implications", "The abstract conceptualization");
    }

    // Sexuality privacy - avoid inappropriate disclosure
    const sexualityPrivacy = persona.sexuality_profile?.privacy_preference;
    if (sexualityPrivacy === "private") {
      forbiddenFrames.push("Speaking from personal experience in bed", "My sexual encounters", "Between the sheets");
    }

    // Build must-include requirements by intent
    const mustIncludeOneOf = this.buildMustIncludeRequirements(persona);

    return {
      forbidden_frames: [...new Set(forbiddenFrames)].slice(0, 10),
      must_include_one_of: mustIncludeOneOf
    };
  }

  /**
   * Build must-include requirements for different response intents
   */
  private buildMustIncludeRequirements(persona: PersonaV2): Record<string, string[]> {
    const requirements: Record<string, string[]> = {
      critique: ["specific_detail", "example", "personal_relevance"],
      advice: ["actionable_step", "constraint_awareness", "fallback_option"],
      story: ["concrete_detail", "emotional_marker", "time_reference"],
      opinion: ["supporting_evidence", "personal_stake", "nuance_acknowledgment"]
    };

    // Customize based on expertise domains
    const expertise = persona.knowledge_profile?.domains_of_expertise || [];
    if (expertise.length > 0) {
      requirements.critique.push("domain_expertise");
      requirements.advice.push("professional_insight");
    }

    // Customize based on personality
    const conscientiousness = persona.cognitive_profile?.big_five?.conscientiousness || 0.5;
    if (conscientiousness > 0.7) {
      requirements.advice.push("systematic_approach");
    }

    const extraversion = persona.cognitive_profile?.big_five?.extraversion || 0.5;
    if (extraversion > 0.7) {
      requirements.story.push("social_context");
    }

    return requirements;
  }

  /**
   * Extract key memory anchors for behavioral consistency
   */
  extractMemoryKeys(persona: PersonaV2): string[] {
    const memoryKeys: string[] = [];
    
    // From long-term memory events
    const longTermEvents = persona.memory?.long_term_events || [];
    longTermEvents.forEach(event => {
      if (event.impact_on_behavior) {
        memoryKeys.push(event.event.substring(0, 50)); // truncate for efficiency
      }
    });

    // From major life context
    if (persona.life_context?.background_narrative) {
      const narrative = persona.life_context.background_narrative;
      // Extract key phrases (simplified - could use NLP)
      const keyPhrases = narrative.split('.').slice(0, 2).map(s => s.trim());
      memoryKeys.push(...keyPhrases);
    }

    // From contradictions that shape behavior
    const contradictions = persona.contradictions || [];
    contradictions.forEach(contradiction => {
      if (contradiction.belief) {
        memoryKeys.push(contradiction.belief.substring(0, 40));
      }
    });

    // From major stressors and supports
    if (persona.life_context?.stressors) {
      memoryKeys.push(...persona.life_context.stressors.slice(0, 2));
    }
    if (persona.life_context?.supports) {
      memoryKeys.push(...persona.life_context.supports.slice(0, 2));
    }

    // From occupation and identity markers
    if (persona.identity?.occupation) {
      memoryKeys.push(`works as ${persona.identity.occupation}`);
    }
    if (persona.identity?.location) {
      const loc = persona.identity.location;
      memoryKeys.push(`lives in ${loc.city}, ${loc.region}`);
    }

    return [...new Set(memoryKeys)].slice(0, 8); // dedupe and limit
  }
}