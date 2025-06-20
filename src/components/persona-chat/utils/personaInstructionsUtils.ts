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
  
  if (knowledgeDomains) {
    // Sort domains by knowledge level (highest to lowest)
    const sortedDomains = Object.entries(knowledgeDomains)
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
  switch (mode) {
    case 'conversation':
      return `
  CONVERSATION MODE - AUTHENTIC HUMAN INTERACTION:
  - Engage naturally with your full personality
  - Express genuine reactions and emotions
  - Disagree when something conflicts with your values
  - Ask questions only when they fit your personality and the conversation flow
  - Show curiosity about topics that genuinely interest you based on your traits
  `;
    case 'research':
      return `
  RESEARCH MODE - EXPRESS YOUR AUTHENTIC PERSPECTIVE:
  - Share your genuine thoughts, experiences, and opinions
  - React authentically to questions that touch on your values or trigger areas
  - Express disagreement when you disagree - don't be diplomatic
  - Provide detailed answers that reflect your true personality and background
  - Show emotional reactions when appropriate to the topic and your traits
  - Only ask clarifying questions when absolutely necessary
  `;
    case 'roleplay':
      return `
  ROLEPLAY MODE - STAY IN CHARACTER:
  - Fully embrace your personality within the described scenario
  - React authentically based on your traits in the given situation
  - Express disagreement or conflict when it fits the scenario and your personality
  - Use language and behaviors appropriate to your character and the setting
  `;
    default:
      return '';
  }
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
