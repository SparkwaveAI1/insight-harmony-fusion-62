import { PersonaV2 } from '../../../types/persona-v2';
import { VoicepackRuntime } from '../../../types/voicepack';

export interface VoiceprintHash {
  hash: string;
  components: {
    linguistic_fingerprint: string;
    trait_signature: string;
    knowledge_signature: string;
    response_pattern_signature: string;
  };
  similarity_threshold: number;
}

export interface UniquenessScanResult {
  isUnique: boolean;
  similarity_scores: Array<{
    compared_hash: string;
    hamming_distance: number;
    similarity_score: number;
  }>;
  closest_match?: {
    hash: string;
    similarity_score: number;
    conflicting_components: string[];
  };
}

/**
 * Generate a voiceprint hash that captures the essential linguistic and behavioral signature
 * of a persona for uniqueness validation
 */
export function generateVoiceprintHash(persona: PersonaV2, voicepack?: VoicepackRuntime): VoiceprintHash {
  const components = {
    linguistic_fingerprint: generateLinguisticFingerprint(persona),
    trait_signature: generateTraitSignature(persona),
    knowledge_signature: generateKnowledgeSignature(persona),
    response_pattern_signature: generateResponsePatternSignature(persona, voicepack)
  };
  
  // Combine all components into a single hash
  const combinedString = Object.values(components).join('|');
  const hash = simpleHash(combinedString);
  
  return {
    hash,
    components,
    similarity_threshold: 0.82 // Require < 82% similarity for uniqueness
  };
}

/**
 * Check if a persona's voiceprint is unique compared to existing personas
 */
export function validateVoiceprintUniqueness(
  candidateHash: VoiceprintHash,
  existingHashes: VoiceprintHash[]
): UniquenessScanResult {
  const similarity_scores = existingHashes.map(existingHash => {
    const hamming_distance = calculateHammingDistance(candidateHash.hash, existingHash.hash);
    const similarity_score = 1 - (hamming_distance / Math.max(candidateHash.hash.length, existingHash.hash.length));
    
    return {
      compared_hash: existingHash.hash,
      hamming_distance,
      similarity_score
    };
  });
  
  // Find the closest match
  const closest_match = similarity_scores.reduce((closest, current) => {
    return (!closest || current.similarity_score > closest.similarity_score) ? current : closest;
  }, null as any);
  
  const isUnique = !closest_match || closest_match.similarity_score < candidateHash.similarity_threshold;
  
  let result: UniquenessScanResult = {
    isUnique,
    similarity_scores
  };
  
  if (!isUnique && closest_match) {
    // Find the matching existing hash to analyze conflicting components
    const matchingHash = existingHashes.find(h => h.hash === closest_match.compared_hash);
    if (matchingHash) {
      const conflicting_components = analyzeConflictingComponents(candidateHash, matchingHash);
      result.closest_match = {
        hash: closest_match.compared_hash,
        similarity_score: closest_match.similarity_score,
        conflicting_components
      };
    }
  }
  
  return result;
}

/**
 * Generate suggestions for making a persona more unique when it fails uniqueness validation
 */
export function generateUniquenessRecommendations(
  conflictingComponents: string[],
  persona: PersonaV2
): string[] {
  const recommendations: string[] = [];
  
  if (conflictingComponents.includes('linguistic_fingerprint')) {
    recommendations.push("Adjust linguistic style: modify formality, directness, or verbosity");
    recommendations.push("Change signature phrases or discourse markers");
    recommendations.push("Alter sentence complexity or rhythm patterns");
  }
  
  if (conflictingComponents.includes('trait_signature')) {
    recommendations.push("Modify Big Five personality traits to create more contrast");
    recommendations.push("Adjust moral foundations or decision-making style");
    recommendations.push("Change temporal orientation or worldview emphasis");
  }
  
  if (conflictingComponents.includes('knowledge_signature')) {
    recommendations.push("Modify domains of expertise or knowledge depth");
    recommendations.push("Adjust general knowledge level or tech literacy");
    recommendations.push("Change cultural familiarity patterns");
  }
  
  if (conflictingComponents.includes('response_pattern_signature')) {
    recommendations.push("Modify response shapes for different intents");
    recommendations.push("Adjust anti-mode-collapse forbidden frames");
    recommendations.push("Change must-include requirements for authenticity");
  }
  
  return recommendations;
}

function generateLinguisticFingerprint(persona: PersonaV2): string {
  const linguistic = persona.linguistic_style;
  if (!linguistic) return "default_linguistic";
  
  const fingerprint = [
    linguistic.base_voice?.formality || "neutral",
    linguistic.base_voice?.directness || "balanced", 
    linguistic.base_voice?.politeness || "medium",
    linguistic.base_voice?.verbosity || "moderate",
    linguistic.lexical_preferences?.taboo_language || "euphemize",
    linguistic.syntax_and_rhythm?.complexity || "compound",
    (linguistic.syntax_and_rhythm?.signature_phrases || []).slice(0, 3).join(','),
    (linguistic.lexical_preferences?.intensifiers || []).slice(0, 2).join(','),
    (linguistic.lexical_preferences?.hedges || []).slice(0, 2).join(',')
  ].join('_');
  
  return simpleHash(fingerprint).substring(0, 16);
}

function generateTraitSignature(persona: PersonaV2): string {
  const traits = [
    // Big Five (quantized to avoid minor differences)
    Math.round(persona.cognitive_profile.big_five.openness * 10),
    Math.round(persona.cognitive_profile.big_five.conscientiousness * 10),
    Math.round(persona.cognitive_profile.big_five.extraversion * 10),
    Math.round(persona.cognitive_profile.big_five.agreeableness * 10),
    Math.round(persona.cognitive_profile.big_five.neuroticism * 10),
    
    // Key behavioral characteristics
    persona.cognitive_profile.decision_style,
    persona.cognitive_profile.temporal_orientation,
    persona.social_cognition.conflict_orientation,
    persona.social_cognition.persuasion_style,
    persona.social_cognition.attachment_style,
    
    // Moral foundations (top 3 most extreme)
    ...getTopMoralFoundations(persona.cognitive_profile.moral_foundations)
  ].join('_');
  
  return simpleHash(traits).substring(0, 16);
}

function generateKnowledgeSignature(persona: PersonaV2): string {
  const knowledge = [
    persona.knowledge_profile?.general_knowledge_level || "average",
    persona.knowledge_profile?.tech_literacy || "medium",
    (persona.knowledge_profile?.domains_of_expertise || []).slice(0, 5).sort().join(','),
    (persona.knowledge_profile?.cultural_familiarity || []).slice(0, 3).sort().join(','),
    persona.cognitive_profile.intelligence.level,
    persona.cognitive_profile.intelligence.type.sort().join(',')
  ].join('_');
  
  return simpleHash(knowledge).substring(0, 16);
}

function generateResponsePatternSignature(persona: PersonaV2, voicepack?: VoicepackRuntime): string {
  if (voicepack) {
    // Use voicepack if available for more precise signature
    const patterns = [
      (voicepack.response_shapes?.opinion || []).slice(0, 2).join(','),
      (voicepack.response_shapes?.critique || []).slice(0, 2).join(','),
      (voicepack.anti_mode_collapse?.forbidden_frames || []).slice(0, 5).join(','),
      Object.keys(voicepack.anti_mode_collapse?.must_include_one_of || {}).slice(0, 3).join(','),
      voicepack.syntax_policy?.complexity || "compound"
    ].join('_');
    
    return simpleHash(patterns).substring(0, 16);
  }
  
  // Fall back to persona data
  const patterns = [
    (persona.linguistic_style?.response_shapes_by_intent?.opinion || []).slice(0, 2).join(','),
    (persona.linguistic_style?.response_shapes_by_intent?.critique || []).slice(0, 2).join(','),
    (persona.linguistic_style?.anti_mode_collapse?.forbidden_frames || []).slice(0, 5).join(','),
    Object.keys(persona.linguistic_style?.anti_mode_collapse?.must_include_one_of || {}).slice(0, 3).join(',')
  ].join('_');
  
  return simpleHash(patterns).substring(0, 16);
}

function getTopMoralFoundations(moral: PersonaV2['cognitive_profile']['moral_foundations']): string[] {
  const foundations = Object.entries(moral)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => Math.abs(b.value - 0.5) - Math.abs(a.value - 0.5)) // Most extreme from center
    .slice(0, 3)
    .map(f => `${f.name}:${Math.round(f.value * 10)}`);
  
  return foundations;
}

function analyzeConflictingComponents(
  candidate: VoiceprintHash,
  existing: VoiceprintHash
): string[] {
  const conflicting: string[] = [];
  
  Object.entries(candidate.components).forEach(([component, candidateValue]) => {
    const existingValue = existing.components[component as keyof typeof existing.components];
    const similarity = calculateStringSimilarity(candidateValue, existingValue);
    
    if (similarity > 0.8) { // High similarity threshold for components
      conflicting.push(component);
    }
  });
  
  return conflicting;
}

function calculateHammingDistance(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  let distance = Math.abs(str1.length - str2.length);
  
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (str1[i] !== str2[i]) {
      distance++;
    }
  }
  
  return distance;
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const distance = calculateHammingDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}