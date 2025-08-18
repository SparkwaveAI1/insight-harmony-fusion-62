import { PersonaV2 } from '../../../types/persona-v2';

export class LinguisticCompiler {
  /**
   * Compile lexicon from PersonaV2 linguistic style
   */
  async compileLexicon(persona: PersonaV2) {
    const linguistic = persona.linguistic_style;
    const identity = persona.identity;
    const sexuality = persona.sexuality_profile;

    // Generate signature tokens from background and traits
    const signatureTokens = this.extractSignatureTokens(persona);
    
    // Build discourse markers based on formality
    const discourseMarkers = this.buildDiscourseMarkers(linguistic);
    
    // Build interjections based on personality
    const interjections = this.buildInterjections(persona);

    return {
      signature_tokens: signatureTokens,
      discourse_markers: discourseMarkers,
      interjections: interjections
    };
  }

  private extractSignatureTokens(persona: PersonaV2): string[] {
    const tokens: string[] = [];
    
    // From linguistic signature phrases
    if (persona.linguistic_style?.syntax_and_rhythm?.signature_phrases) {
      tokens.push(...persona.linguistic_style.syntax_and_rhythm.signature_phrases);
    }

    // From occupation
    const occupation = persona.identity?.occupation;
    if (occupation?.includes("teacher")) tokens.push("you know", "let me explain", "for example");
    if (occupation?.includes("engineer")) tokens.push("basically", "essentially", "in terms of");
    if (occupation?.includes("artist")) tokens.push("honestly", "I feel like", "it's like");

    // From regional/cultural influences
    const regional = persona.linguistic_style?.base_voice?.register_examples;
    if (regional) tokens.push(...regional.slice(0, 3));

    // From personality traits
    const bigFive = persona.cognitive_profile?.big_five;
    if (bigFive?.extraversion > 0.7) tokens.push("obviously", "definitely", "totally");
    if (bigFive?.agreeableness > 0.7) tokens.push("I think", "maybe", "kind of");
    if (bigFive?.openness > 0.7) tokens.push("actually", "interestingly", "potentially");

    return [...new Set(tokens)].slice(0, 25); // dedupe and limit
  }

  private buildDiscourseMarkers(linguistic: any): Array<{ term: string; p: number }> {
    const markers: Array<{ term: string; p: number }> = [];
    
    // Base markers with probabilities based on formality
    const formalityLevel = linguistic?.base_voice?.formality || "neutral";
    
    if (formalityLevel === "formal") {
      markers.push(
        { term: "furthermore", p: 0.3 },
        { term: "however", p: 0.4 },
        { term: "therefore", p: 0.3 },
        { term: "consequently", p: 0.2 }
      );
    } else if (formalityLevel === "casual") {
      markers.push(
        { term: "so", p: 0.6 },
        { term: "but", p: 0.5 },
        { term: "and then", p: 0.4 },
        { term: "anyway", p: 0.3 }
      );
    } else {
      markers.push(
        { term: "also", p: 0.4 },
        { term: "though", p: 0.3 },
        { term: "plus", p: 0.3 },
        { term: "still", p: 0.3 }
      );
    }

    return markers;
  }

  private buildInterjections(persona: PersonaV2): Array<{ term: string; p: number }> {
    const interjections: Array<{ term: string; p: number }> = [];
    
    // From disfluencies in linguistic style
    const disfluencies = persona.linguistic_style?.syntax_and_rhythm?.disfluencies || [];
    disfluencies.forEach(term => interjections.push({ term, p: 0.2 }));

    // From personality - neurotic people use more filler words
    const neuroticism = persona.cognitive_profile?.big_five?.neuroticism || 0.5;
    const fillerRate = 0.1 + (neuroticism * 0.3);
    
    interjections.push(
      { term: "um", p: fillerRate },
      { term: "uh", p: fillerRate * 0.8 },
      { term: "like", p: fillerRate * 1.2 }
    );

    return interjections;
  }

  /**
   * Compile syntax policy from PersonaV2 linguistic preferences
   */
  compileSyntaxPolicy(persona: PersonaV2) {
    const linguistic = persona.linguistic_style;
    const bigFive = persona.cognitive_profile?.big_five;
    
    // Sentence length distribution based on verbosity and traits
    const verbosity = linguistic?.base_voice?.verbosity || "moderate";
    const conscientiousness = bigFive?.conscientiousness || 0.5;
    
    let shortPct = 0.3, mediumPct = 0.5, longPct = 0.2;
    
    if (verbosity === "terse") {
      shortPct = 0.6; mediumPct = 0.3; longPct = 0.1;
    } else if (verbosity === "verbose") {
      shortPct = 0.1; mediumPct = 0.4; longPct = 0.5;
    }

    // Conscientiousness affects structure
    const complexity = conscientiousness > 0.7 ? "complex" : 
                      conscientiousness < 0.3 ? "simple" : "compound";

    // Lists frequency
    const listsFreq = linguistic?.syntax_and_rhythm?.lists_frequency_per_200_tokens || 0;

    return {
      sentence_length_dist: { short: shortPct, medium: mediumPct, long: longPct },
      complexity: complexity as "simple" | "compound" | "complex",
      lists_per_200toks_max: Math.min(3, Math.max(0, listsFreq))
    };
  }

  /**
   * Compile response shapes from PersonaV2 response patterns
   */
  compileResponseShapes(persona: PersonaV2): Record<string, string[]> {
    const baseShapes = persona.linguistic_style?.response_shapes_by_intent || {};
    
    // Default shapes with personality adjustments
    const shapes: Record<string, string[]> = {
      opinion: (baseShapes as any)?.opinion || ["stance", "supporting_point", "caveat"],
      critique: (baseShapes as any)?.critique || ["observation", "evidence", "suggestion"],
      advice: (baseShapes as any)?.advice || ["clarify_constraint", "concrete_steps", "fallback"],
      story: (baseShapes as any)?.story || ["context", "turning_point", "takeaway"],
      compare: ["similarity", "key_difference", "implications"],
      clarify: ["reframe_question", "core_point", "check_understanding"]
    };

    // Adjust based on traits
    const conscientiousness = persona.cognitive_profile?.big_five?.conscientiousness || 0.5;
    if (conscientiousness > 0.7) {
      shapes.advice = ["goal", "systematic_steps", "quality_checks"];
    }

    return shapes;
  }
}