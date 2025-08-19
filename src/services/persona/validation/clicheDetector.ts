import { PersonaV2 } from '../../../types/persona-v2';

export interface ClicheAnalysisResult {
  hasCliches: boolean;
  detectedCliches: Array<{
    text: string;
    category: 'generic_frames' | 'overused_phrase' | 'template_language' | 'vague_descriptor';
    location: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
  uniquenessScore: number; // 0-1, higher is more unique
}

// Comprehensive cliché database organized by category
const CLICHE_PATTERNS = {
  generic_frames: [
    "at the end of the day",
    "overall pretty solid", 
    "it's clear what this is about",
    "when all is said and done",
    "to be perfectly honest",
    "the bottom line is",
    "it goes without saying",
    "needless to say",
    "obviously",
    "clearly",
    "basically",
    "essentially",
    "fundamentally",
    "ultimately",
    "in conclusion",
    "to sum up",
    "all things considered",
    "by and large"
  ],
  
  overused_phrases: [
    "think outside the box",
    "low-hanging fruit",
    "move the needle",
    "circle back",
    "touch base",
    "deep dive",
    "game changer",
    "best practice",
    "paradigm shift",
    "synergy",
    "leverage",
    "ecosystem",
    "disruptive",
    "innovative solutions",
    "cutting edge",
    "state of the art",
    "next level",
    "world class"
  ],
  
  template_language: [
    "I believe that",
    "I think that",
    "In my opinion",
    "It seems to me",
    "From my perspective",
    "I would say",
    "I feel like",
    "It appears that",
    "What I find interesting is",
    "One thing I noticed",
    "Here's the thing",
    "The way I see it"
  ],
  
  vague_descriptors: [
    "really good",
    "pretty nice",
    "quite interesting", 
    "fairly decent",
    "somewhat useful",
    "rather effective",
    "relatively straightforward",
    "reasonably well",
    "generally speaking",
    "for the most part",
    "more or less",
    "sort of",
    "kind of",
    "pretty much",
    "something like that",
    "or whatever"
  ],
  
  narrative_templates: [
    "Once upon a time",
    "Long story short",
    "To make a long story short",
    "Anyway",
    "So basically what happened was",
    "The funny thing is",
    "What's interesting is that",
    "The crazy part is",
    "Here's what's weird",
    "You know what's funny"
  ],
  
  filler_responses: [
    "That's a good question",
    "Great question",
    "Interesting point",
    "Good point",
    "Fair enough",
    "True that",
    "Exactly",
    "Absolutely",
    "Totally",
    "For sure",
    "Right on",
    "No doubt"
  ]
};

// Context-specific cliché patterns
const DOMAIN_CLICHES = {
  business: [
    "think outside the box",
    "low-hanging fruit",
    "move the needle",
    "best practice",
    "paradigm shift",
    "synergy",
    "ecosystem",
    "scalable solution",
    "actionable insights"
  ],
  
  technology: [
    "cutting edge",
    "bleeding edge",
    "revolutionary",
    "game changing",
    "disruptive innovation",
    "seamless integration",
    "user-friendly",
    "intuitive interface",
    "robust architecture"
  ],
  
  academic: [
    "further research is needed",
    "it is well established",
    "extensive literature",
    "comprehensive analysis",
    "rigorous methodology",
    "significant implications",
    "important to note"
  ],
  
  casual: [
    "awesome",
    "super cool", 
    "totally amazing",
    "really awesome",
    "pretty sweet",
    "really neat",
    "kinda cool"
  ]
};

/**
 * Analyze a persona for clichés and template language that reduces uniqueness
 */
export function detectCliches(persona: PersonaV2): ClicheAnalysisResult {
  const detectedCliches: ClicheAnalysisResult['detectedCliches'] = [];
  
  // Check various text fields in the persona
  const textFields = extractTextFields(persona);
  
  textFields.forEach(({ text, location }) => {
    const clichesInText = findClichesInText(text, location);
    detectedCliches.push(...clichesInText);
  });
  
  // Calculate uniqueness score
  const uniquenessScore = calculateUniquenessScore(detectedCliches, textFields);
  
  // Generate suggestions for improvement
  const suggestions = generateClicheRemovalSuggestions(detectedCliches);
  
  return {
    hasCliches: detectedCliches.length > 0,
    detectedCliches,
    suggestions,
    uniquenessScore
  };
}

/**
 * Enhanced validation that includes persona-specific cliché patterns
 */
export function validatePersonaUniqueness(persona: PersonaV2): {
  passesValidation: boolean;
  issues: string[];
  recommendations: string[];
  uniquenessScore: number;
} {
  const clicheAnalysis = detectCliches(persona);
  const narrativeAnalysis = analyzeNarrativeUniqueness(persona);
  const signatureAnalysis = analyzeSignaturePhrases(persona);
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (clicheAnalysis.hasCliches) {
    const highSeverityCliches = clicheAnalysis.detectedCliches.filter(c => c.severity === 'high');
    if (highSeverityCliches.length > 0) {
      issues.push(`${highSeverityCliches.length} high-severity clichés detected`);
    }
    recommendations.push(...clicheAnalysis.suggestions);
  }
  
  if (narrativeAnalysis.hasTemplateStructure) {
    issues.push("Background narrative uses template structure");
    recommendations.push("Rewrite background with specific, concrete details");
  }
  
  if (signatureAnalysis.lacksSig) {
    issues.push("Missing distinctive signature phrases");
    recommendations.push("Add 2-3 persona-specific signature phrases");
  }
  
  const overallUniqueness = Math.min(
    clicheAnalysis.uniquenessScore,
    narrativeAnalysis.uniquenessScore,
    signatureAnalysis.uniquenessScore
  );
  
  return {
    passesValidation: issues.length === 0 && overallUniqueness > 0.7,
    issues,
    recommendations,
    uniquenessScore: overallUniqueness
  };
}

function extractTextFields(persona: PersonaV2): Array<{text: string, location: string}> {
  const fields: Array<{text: string, location: string}> = [];
  
  // Core narrative fields
  if (persona.life_context?.background_narrative) {
    fields.push({ text: persona.life_context.background_narrative, location: 'life_context.background_narrative' });
  }
  if (persona.life_context?.current_situation) {
    fields.push({ text: persona.life_context.current_situation, location: 'life_context.current_situation' });
  }
  if (persona.cognitive_profile?.worldview_summary) {
    fields.push({ text: persona.cognitive_profile.worldview_summary, location: 'cognitive_profile.worldview_summary' });
  }
  
  // Linguistic style elements
  if (persona.linguistic_style?.base_voice?.register_examples) {
    persona.linguistic_style.base_voice.register_examples.forEach((example, i) => {
      fields.push({ text: example, location: `linguistic_style.base_voice.register_examples[${i}]` });
    });
  }
  
  if (persona.linguistic_style?.syntax_and_rhythm?.signature_phrases) {
    persona.linguistic_style.syntax_and_rhythm.signature_phrases.forEach((phrase, i) => {
      fields.push({ text: phrase, location: `linguistic_style.syntax_and_rhythm.signature_phrases[${i}]` });
    });
  }
  
  // Response shape templates
  if (persona.linguistic_style?.response_shapes_by_intent) {
    Object.entries(persona.linguistic_style.response_shapes_by_intent).forEach(([intent, shapes]) => {
      shapes.forEach((shape, i) => {
        fields.push({ text: shape, location: `linguistic_style.response_shapes_by_intent.${intent}[${i}]` });
      });
    });
  }
  
  // Memory events
  if (persona.memory?.long_term_events) {
    persona.memory.long_term_events.forEach((event, i) => {
      fields.push({ text: event.event, location: `memory.long_term_events[${i}].event` });
      if (event.impact_on_behavior) {
        fields.push({ text: event.impact_on_behavior, location: `memory.long_term_events[${i}].impact_on_behavior` });
      }
    });
  }
  
  return fields;
}

function findClichesInText(text: string, location: string): ClicheAnalysisResult['detectedCliches'] {
  const found: ClicheAnalysisResult['detectedCliches'] = [];
  const lowerText = text.toLowerCase();
  
  // Check each category of clichés
  Object.entries(CLICHE_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        found.push({
          text: pattern,
          category: category as any,
          location,
          severity: determineSeverity(pattern, category, location)
        });
      }
    });
  });
  
  // Check domain-specific clichés based on location/context
  const domain = inferDomainFromLocation(location);
  if (domain && DOMAIN_CLICHES[domain]) {
    DOMAIN_CLICHES[domain].forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        found.push({
          text: pattern,
          category: 'overused_phrase',
          location,
          severity: 'high' // Domain clichés are especially problematic
        });
      }
    });
  }
  
  return found;
}

function determineSeverity(pattern: string, category: string, location: string): 'low' | 'medium' | 'high' {
  // Generic frames are high severity
  if (category === 'generic_frames') return 'high';
  
  // Signature phrases should never be clichés
  if (location.includes('signature_phrases')) return 'high';
  
  // Response shapes with clichés are medium-high severity
  if (location.includes('response_shapes')) return 'high';
  
  // Background narrative clichés are medium severity
  if (location.includes('background_narrative') || location.includes('worldview_summary')) return 'medium';
  
  // Other locations are low severity
  return 'low';
}

function inferDomainFromLocation(location: string): keyof typeof DOMAIN_CLICHES | null {
  if (location.includes('business') || location.includes('management')) return 'business';
  if (location.includes('tech') || location.includes('programming')) return 'technology';
  if (location.includes('academic') || location.includes('research')) return 'academic';
  return 'casual'; // Default to casual domain
}

function calculateUniquenessScore(cliches: ClicheAnalysisResult['detectedCliches'], textFields: Array<{text: string, location: string}>): number {
  if (textFields.length === 0) return 1.0;
  
  const totalTextLength = textFields.reduce((sum, field) => sum + field.text.length, 0);
  const clicheCharacters = cliches.reduce((sum, cliche) => sum + cliche.text.length, 0);
  
  // Base score from cliché density
  const clicheDensity = clicheCharacters / totalTextLength;
  const baseScore = Math.max(0, 1 - (clicheDensity * 5)); // Penalize heavily
  
  // Severity penalties
  const severityPenalty = cliches.reduce((penalty, cliche) => {
    switch (cliche.severity) {
      case 'high': return penalty + 0.15;
      case 'medium': return penalty + 0.08;
      case 'low': return penalty + 0.03;
    }
  }, 0);
  
  return Math.max(0, baseScore - severityPenalty);
}

function analyzeNarrativeUniqueness(persona: PersonaV2): {
  hasTemplateStructure: boolean;
  uniquenessScore: number;
} {
  const narrative = persona.life_context?.background_narrative || "";
  
  // Check for template structures
  const templateIndicators = [
    /^[A-Z][a-z]+ is a \d+-year-old/,  // "John is a 35-year-old..."
    /^Born in \d{4}/,                   // "Born in 1985..."
    /^Growing up in/,                   // "Growing up in..."
    /^After graduating from/,           // "After graduating from..."
    /currently works? as/i,             // "currently works as"
    /lives? in [A-Z][a-z]+ with/,      // "lives in Boston with"
  ];
  
  const hasTemplateStructure = templateIndicators.some(pattern => pattern.test(narrative));
  
  // Check for specific, concrete details
  const specificityIndicators = [
    /\b\d{4}\b/,                       // Years
    /\b[A-Z][a-z]+ (St|Ave|Blvd|Rd)\b/, // Street addresses
    /\$\d+/,                           // Specific dollar amounts
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Specific months
  ];
  
  const specificityCount = specificityIndicators.filter(pattern => pattern.test(narrative)).length;
  const specificityScore = Math.min(1, specificityCount / 3); // Target 3+ specific details
  
  const uniquenessScore = hasTemplateStructure ? 
    Math.min(0.4, specificityScore) : // Templates cap at 0.4 even with specificity
    specificityScore;
  
  return {
    hasTemplateStructure,
    uniquenessScore
  };
}

function analyzeSignaturePhrases(persona: PersonaV2): {
  lacksSig: boolean;
  uniquenessScore: number;
} {
  const signaturePhrases = persona.linguistic_style?.syntax_and_rhythm?.signature_phrases || [];
  
  if (signaturePhrases.length < 2) {
    return { lacksSig: true, uniquenessScore: 0.3 };
  }
  
  // Check if signature phrases are actually unique (not clichés)
  const uniquePhrases = signaturePhrases.filter(phrase => {
    return !Object.values(CLICHE_PATTERNS).flat().some(cliche => 
      phrase.toLowerCase().includes(cliche.toLowerCase())
    );
  });
  
  const uniquenessScore = Math.min(1, uniquePhrases.length / 3); // Target 3+ unique signatures
  
  return {
    lacksSig: uniquePhrases.length < 2,
    uniquenessScore
  };
}

function generateClicheRemovalSuggestions(cliches: ClicheAnalysisResult['detectedCliches']): string[] {
  const suggestions: string[] = [];
  const categories = [...new Set(cliches.map(c => c.category))];
  
  if (categories.includes('generic_frames')) {
    suggestions.push("Replace generic transition phrases with persona-specific language patterns");
  }
  
  if (categories.includes('overused_phrase')) {
    suggestions.push("Substitute business/technical clichés with domain-specific, concrete terminology");
  }
  
  if (categories.includes('template_language')) {
    suggestions.push("Eliminate opinion markers and replace with assertive, character-consistent phrasing");
  }
  
  if (categories.includes('vague_descriptor')) {
    suggestions.push("Replace vague qualifiers with specific, measurable descriptors");
  }
  
  const highSeverityLocations = cliches
    .filter(c => c.severity === 'high')
    .map(c => c.location.split('.')[0])
    .filter((loc, i, arr) => arr.indexOf(loc) === i);
  
  if (highSeverityLocations.length > 0) {
    suggestions.push(`Priority: rewrite ${highSeverityLocations.join(', ')} to eliminate high-severity clichés`);
  }
  
  return suggestions;
}
