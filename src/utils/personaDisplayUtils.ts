// Utility functions to safely extract display data from V4 personas
// This handles the transition from conversation_summary to full_profile structure

import { V4Persona, V4FullProfile } from '@/types/persona-v4';

/**
 * Safely extract display name from V4 persona
 */
export function getPersonaDisplayName(persona: V4Persona): string {
  // Try full_profile identity first
  if (persona.full_profile?.identity?.name) {
    return persona.full_profile.identity.name;
  }
  
  // Fallback to persona name
  return persona.name;
}

/**
 * Safely extract age from V4 persona
 */
export function getPersonaAge(persona: V4Persona): number | undefined {
  // Prefer conversation_summary demographics if present
  const csAge: any = persona.conversation_summary?.demographics?.age;
  if (csAge !== undefined && csAge !== null && csAge !== '') {
    const n = typeof csAge === 'number' ? csAge : parseInt(String(csAge));
    return isNaN(n) ? undefined : n;
  }

  // Fallback to full_profile identity
  const fpAge: any = persona.full_profile?.identity?.age;
  if (fpAge !== undefined && fpAge !== null && fpAge !== '') {
    const n = typeof fpAge === 'number' ? fpAge : parseInt(String(fpAge));
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

/**
 * Safely extract occupation from V4 persona
 */
export function getPersonaOccupation(persona: V4Persona): string | undefined {
  return persona.full_profile?.identity?.occupation;
}

/**
 * Safely extract location from V4 persona
 */
export function getPersonaLocation(persona: V4Persona): string | undefined {
  // First check conversation_summary demographics (legacy data)
  if (persona.conversation_summary?.demographics?.location) {
    return persona.conversation_summary.demographics.location;
  }
  
  // Then check full_profile identity (new structure)
  if (persona.full_profile?.identity?.location) {
    const loc = persona.full_profile.identity.location;
    if (typeof loc === 'string') return loc;
    
    // Handle location object
    if (typeof loc === 'object' && loc.city && loc.region) {
      return `${loc.city}, ${loc.region}`;
    }
  }
  return undefined;
}

/**
 * Safely extract background description from V4 persona
 */
export function getPersonaBackgroundDescription(persona: V4Persona): string | undefined {
  // Prefer the actual background story from conversation_summary
  if (persona.conversation_summary?.demographics?.background_description) {
    return persona.conversation_summary.demographics.background_description;
  }
  
  // Only use attitude_narrative fallback for legacy personas (not V4)
  if (persona.schema_version !== 'v4.0' && persona.full_profile?.attitude_narrative) {
    return persona.full_profile.attitude_narrative;
  }
  
  // Last resort: generate from available data (legacy personas only)
  if (persona.schema_version !== 'v4.0') {
    const age = getPersonaAge(persona);
    const occupation = getPersonaOccupation(persona);
    const location = getPersonaLocation(persona);
    
    if (age && occupation && location) {
      return `${age}-year-old ${occupation} from ${location}`;
    }
  }
  
  return undefined;
}

/**
 * Safely extract character description (essence) from V4 persona
 */
export function getPersonaDescription(persona: V4Persona): string | undefined {
  // Check for character_description first (from Phase 2 generation)
  if (persona.conversation_summary?.character_description) {
    return persona.conversation_summary.character_description;
  }
  
  return undefined;
}

/**
 * Check if persona has knowledge in a specific domain
 * This replaces the old knowledge_profile checks
 */
export function hasKnowledgeInDomain(persona: V4Persona, domain: string): boolean {
  // Since knowledge_profile is removed, we check occupation and other traits
  const occupation = getPersonaOccupation(persona)?.toLowerCase() || '';
  const domainLower = domain.toLowerCase();
  
  // Simple domain matching based on occupation
  const domainMapping: Record<string, string[]> = {
    'technology': ['engineer', 'developer', 'programmer', 'tech', 'software', 'computer'],
    'finance': ['banker', 'accountant', 'financial', 'analyst', 'investor'],
    'healthcare': ['doctor', 'nurse', 'physician', 'medical', 'health'],
    'education': ['teacher', 'professor', 'educator', 'instructor'],
    'business': ['manager', 'executive', 'entrepreneur', 'consultant'],
    'construction': ['contractor', 'electrician', 'plumber', 'builder'],
    'military': ['soldier', 'veteran', 'officer', 'military'],
    'politics': ['politician', 'government', 'policy', 'civic']
  };
  
  const keywords = domainMapping[domainLower] || [domainLower];
  return keywords.some(keyword => occupation.includes(keyword));
}

/**
 * Get knowledge domains for a persona based on their profile
 */
export function getPersonaKnowledgeDomains(persona: V4Persona): string[] {
  const domains = [];
  const occupation = getPersonaOccupation(persona)?.toLowerCase() || '';
  
  // Infer domains from occupation
  if (occupation.includes('engineer') || occupation.includes('tech') || occupation.includes('developer')) {
    domains.push('technology');
  }
  if (occupation.includes('financial') || occupation.includes('banker') || occupation.includes('accountant')) {
    domains.push('finance');
  }
  if (occupation.includes('doctor') || occupation.includes('nurse') || occupation.includes('medical')) {
    domains.push('healthcare');
  }
  if (occupation.includes('teacher') || occupation.includes('professor') || occupation.includes('educator')) {
    domains.push('education');
  }
  if (occupation.includes('manager') || occupation.includes('executive') || occupation.includes('business')) {
    domains.push('business');
  }
  if (occupation.includes('contractor') || occupation.includes('electrician') || occupation.includes('construction')) {
    domains.push('construction');
  }
  if (occupation.includes('veteran') || occupation.includes('military') || occupation.includes('soldier')) {
    domains.push('military');
  }
  
  return domains;
}

/**
 * Extract available trait categories from full_profile
 */
export function getAvailableTraitCategories(fullProfile: V4FullProfile): string[] {
  if (!fullProfile) return [];
  
  const categories = [];
  
  if (fullProfile.identity) categories.push('identity');
  if (fullProfile.motivation_profile) categories.push('motivation_profile');
  if (fullProfile.humor_profile) categories.push('humor_profile');
  if (fullProfile.truth_honesty_profile) categories.push('truth_honesty_profile');
  if (fullProfile.bias_profile) categories.push('bias_profile');
  if (fullProfile.cognitive_profile) categories.push('cognitive_profile');
  if (fullProfile.daily_life) categories.push('daily_life');
  if (fullProfile.communication_style) categories.push('communication_style');
  if (fullProfile.emotional_profile) categories.push('emotional_profile');
  if (fullProfile.sexuality_profile) categories.push('sexuality_profile');
  if (fullProfile.attitude_narrative) categories.push('attitude_narrative');
  if (fullProfile.political_narrative) categories.push('political_narrative');
  
  return categories;
}