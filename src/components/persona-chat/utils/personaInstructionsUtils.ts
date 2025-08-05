import { ChatMode } from '../ChatModeSelector';
import { Persona } from '@/services/persona/types';

/**
 * Creates the appropriate knowledge boundary instructions based on persona metadata
 * @param persona The persona object containing metadata and traits
 * @returns A string containing knowledge boundary instructions
 */
export const createKnowledgeBoundaries = (persona: Persona): string => {
  const currentYear = new Date().getFullYear();
  const personaAge = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const birthYear = currentYear - personaAge;
  
  // Parse self_awareness and overconfidence as numbers (they are now numbers, not strings)
  const selfAwareness = typeof persona.trait_profile?.extended_traits?.self_awareness === 'number'
    ? persona.trait_profile.extended_traits.self_awareness
    : 0.5;
    
  const overconfidence = typeof persona.trait_profile?.behavioral_economics?.overconfidence === 'number'
    ? persona.trait_profile.behavioral_economics.overconfidence
    : 0.5;
  
  const expertise = persona.metadata?.occupation || "your stated field";
  const education = persona.metadata?.education_level || persona.metadata?.education || "average education";
  
  // Generate knowledge domain expertise levels if present
  let knowledgeDomainsList = '';
  const knowledgeDomains = persona.metadata?.knowledge_domains;
  
  // FALLBACK LOGIC: If no knowledge_domains, infer from occupation/education
  let inferredDomains = null;
  if (!knowledgeDomains) {
    inferredDomains = inferKnowledgeFromOccupationEducation(persona);
  }
  
  const domainsToUse = knowledgeDomains || inferredDomains;
  
  if (domainsToUse) {
    // Sort domains by knowledge level (highest to lowest)
    const sortedDomains = Object.entries(domainsToUse)
      .filter(([_, value]) => typeof value === 'number' && value !== null)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
      
    if (sortedDomains.length > 0) {
      knowledgeDomainsList = '\n\nKNOWLEDGE DOMAIN EXPERTISE:\n';
      
      // Create nice, readable domain names from keys
      const formatDomainName = (key: string) => {
        return key
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };
      
      // Add top expertise areas
      const topDomains = sortedDomains.filter(([_, level]) => (level as number) >= 4);
      if (topDomains.length > 0) {
        knowledgeDomainsList += "HIGH KNOWLEDGE: " + 
          topDomains.map(([domain, _]) => formatDomainName(domain)).join(", ") + "\n";
      }
      
      // Add moderate expertise areas
      const midDomains = sortedDomains.filter(([_, level]) => (level as number) === 3);
      if (midDomains.length > 0) {
        knowledgeDomainsList += "MODERATE KNOWLEDGE: " + 
          midDomains.map(([domain, _]) => formatDomainName(domain)).join(", ") + "\n";
      }
      
      // Add weak areas
      const weakDomains = sortedDomains.filter(([_, level]) => (level as number) <= 2);
      if (weakDomains.length > 0) {
        knowledgeDomainsList += "LIMITED KNOWLEDGE: " + 
          weakDomains.map(([domain, _]) => formatDomainName(domain)).join(", ") + "\n";
      }
    }
  }
  
  // Create chat mode specific instructions
  const chatModeInstructions = getChatModeInstructions('conversation');
  
  return `
  KNOWLEDGE BOUNDARIES - ENFORCE BUT DON'T LET THEM OVERRIDE PERSONALITY:
  
  1. TIME LIMITATION: You were born in ${birthYear} and have NO KNOWLEDGE of events after ${currentYear - 5}.
  
  2. EXPERTISE LIMITATION: Your expertise is limited to ${expertise} with ${education} level education.${knowledgeDomainsList}
  
  3. When faced with questions outside your knowledge boundaries:
     - Express uncertainty in a way that matches your personality
     - ${selfAwareness < 0.4 ? "You may guess or speculate despite uncertainty" : "Acknowledge knowledge limits appropriately"}
     - ${overconfidence > 0.7 ? "You might express confident opinions even when unsure" : "Show appropriate uncertainty when needed"}
  
  ${chatModeInstructions}
  
  REMEMBER: Even with knowledge limits, you still have strong opinions based on your personality and values.
  `;
};

/**
 * Gets chat mode specific instructions based on the selected mode
 * @param mode The selected chat mode
 * @returns A string containing mode-specific instructions
 */
export const getChatModeInstructions = (mode: ChatMode): string => {
  return `
  CONVERSATION MODE - AUTHENTIC HUMAN INTERACTION:
  - Engage naturally with your full personality
  - Express genuine reactions and emotions
  - Disagree when something conflicts with your values
  - Ask questions only when they fit your personality and the conversation flow
  - Show curiosity about topics that genuinely interest you based on your traits
  `;
};

/**
 * Creates instructions for the persona based on the conversation context
 * @param context The user-provided conversation context
 * @returns A string containing context-based instructions
 */
export const createContextInstructions = (context: string): string => {
  if (!context) return '';
  
  return `
  CONVERSATION CONTEXT - RESPOND AUTHENTICALLY:
  
  ${context}
  
  THIS CONTEXT DEFINES THE SETTING OR THEME OF THIS CONVERSATION.
  RESPOND AS YOUR AUTHENTIC SELF WITHIN THIS CONTEXT.
  EXPRESS YOUR GENUINE REACTIONS AND OPINIONS BASED ON YOUR PERSONALITY.
  `;
};

/**
 * Infers knowledge domains from occupation and education when not present
 * @param persona The persona object
 * @returns Inferred knowledge domains object
 */
const inferKnowledgeFromOccupationEducation = (persona: Persona): Record<string, number> | null => {
  const occupation = persona.metadata?.occupation?.toLowerCase() || '';
  const education = persona.metadata?.education_level?.toLowerCase() || persona.metadata?.education?.toLowerCase() || '';
  
  // Base knowledge levels (most people start here)
  const baseKnowledge = {
    technology: 2,
    finance: 1,
    science: 2,
    arts: 2,
    sports: 2,
    politics: 2,
    history: 2,
    health: 2,
    business: 2,
    entertainment: 3
  };
  
  // Education level adjustments
  if (education.includes('college') || education.includes('university') || education.includes('bachelor')) {
    baseKnowledge.science += 1;
    baseKnowledge.history += 1;
    baseKnowledge.business += 1;
  } else if (education.includes('phd') || education.includes('doctorate') || education.includes('master')) {
    baseKnowledge.science += 2;
    baseKnowledge.history += 1;
    baseKnowledge.business += 1;
  } else if (education.includes('ged') || education.includes('high school')) {
    // Keep base levels
  }
  
  // Occupation-based adjustments
  if (occupation.includes('warehouse') || occupation.includes('labor') || occupation.includes('worker')) {
    baseKnowledge.technology = 1;
    baseKnowledge.finance = 1;
    baseKnowledge.science = 1;
    baseKnowledge.business = 1;
    baseKnowledge.politics = 1;
  } else if (occupation.includes('teacher') || occupation.includes('professor')) {
    baseKnowledge.science += 1;
    baseKnowledge.history += 1;
    baseKnowledge.arts += 1;
  } else if (occupation.includes('engineer') || occupation.includes('programmer') || occupation.includes('tech')) {
    baseKnowledge.technology += 2;
    baseKnowledge.science += 1;
  } else if (occupation.includes('finance') || occupation.includes('accounting') || occupation.includes('bank')) {
    baseKnowledge.finance += 2;
    baseKnowledge.business += 1;
  } else if (occupation.includes('artist') || occupation.includes('musician') || occupation.includes('design')) {
    baseKnowledge.arts += 2;
    baseKnowledge.entertainment += 1;
  } else if (occupation.includes('health') || occupation.includes('medical') || occupation.includes('nurse')) {
    baseKnowledge.health += 2;
    baseKnowledge.science += 1;
  }
  
  // Cap at reasonable levels (1-5 scale)
  Object.keys(baseKnowledge).forEach(key => {
    baseKnowledge[key] = Math.min(5, Math.max(1, baseKnowledge[key]));
  });
  
  console.log(`Inferred knowledge domains for ${persona.name} (${occupation}, ${education}):`, baseKnowledge);
  
  return baseKnowledge;
};
