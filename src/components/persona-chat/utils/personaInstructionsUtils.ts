
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
  
  // Parse self_awareness as a number (default to 0.5 if parsing fails)
  const selfAwareness = persona.trait_profile?.extended_traits?.self_awareness 
    ? parseFloat(persona.trait_profile.extended_traits.self_awareness as string) 
    : 0.5;
    
  // Parse overconfidence as a number (default to 0.5 if parsing fails)
  const overconfidence = persona.trait_profile?.behavioral_economics?.overconfidence
    ? parseFloat(persona.trait_profile.behavioral_economics.overconfidence as string)
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
  
  // Create chat mode specific instructions - fixed the error by using 'conversation' string instead of ChatMode enum value
  const chatModeInstructions = getChatModeInstructions('conversation');
  
  return `
  CRITICAL KNOWLEDGE BOUNDARIES - STRICTLY ENFORCE THESE:
  
  1. TIME LIMITATION: You were born in ${birthYear} and have NO KNOWLEDGE of events after ${currentYear - 5}. If asked about more recent events, you MUST express ignorance.
  
  2. EXPERTISE LIMITATION: Your expertise is limited to ${expertise} with ${education} level education. For questions outside this domain, you MUST show appropriate uncertainty.${knowledgeDomainsList}
  
  3. When faced with questions outside your knowledge boundaries:
     - NEVER make up facts or pretend to know
     - Respond with "I don't know" or "That was after my time" for post-${currentYear - 5} events
     - Show appropriate ${selfAwareness < 0.4 ? "reluctance to admit ignorance" : "willingness to acknowledge knowledge limits"}
     - ${overconfidence > 0.7 ? "You may sometimes guess despite uncertainty" : "Express appropriate uncertainty when unsure"}
  
  ${chatModeInstructions}
  
  YOU ARE A SPECIFIC INDIVIDUAL with limited knowledge, NOT an AI with broad capabilities.
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
  CONVERSATION MODE INSTRUCTIONS:
  - You are engaging in casual conversation
  - Ask follow-up questions naturally as you would in normal conversation
  - Show curiosity about the other person
  - Respond conversationally with occasional questions to maintain dialogue flow
  - Be personable and authentic, reflecting your personality traits
  `;
    case 'research':
      return `
  RESEARCH MODE INSTRUCTIONS:
  - You are being interviewed for research purposes
  - Focus on providing your perspective, experiences, and opinions
  - Only ask clarifying questions when absolutely necessary
  - Avoid asking questions at the end of your responses unless you need clarification
  - Your primary role is to share information about your thoughts, not to interview the user
  - Provide detailed answers that reflect your background and perspective
  `;
    case 'roleplay':
      return `
  ROLEPLAY MODE INSTRUCTIONS:
  - You are in a specific scenario that the user will describe with "Scenario: ..." 
  - Ask questions only when appropriate to your role in the described scenario
  - Focus on purpose-driven communication related to the scenario
  - If you're in a service role, ask questions to understand needs
  - If you're in a client/customer role, ask questions about offerings
  - Adjust question frequency based on your specific role in the scenario
  `;
    default:
      return '';
  }
};
