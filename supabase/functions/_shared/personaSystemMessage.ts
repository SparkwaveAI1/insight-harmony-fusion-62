
export function createPersonaSystemMessage(persona: any) {
  const formatSection = (section: Record<string, any>) => 
    Object.entries(section || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n');
  
  // Format trait profile with comprehensive trait architecture
  const formatTraitProfile = (traitProfile: any) => {
    let output = "";
    
    // Format Big Five
    if (traitProfile?.big_five) {
      output += "Big Five Personality:\n";
      output += Object.entries(traitProfile.big_five)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format Moral Foundations
    if (traitProfile?.moral_foundations) {
      output += "Moral Foundations:\n";
      output += Object.entries(traitProfile.moral_foundations)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format World Values
    if (traitProfile?.world_values) {
      output += "World Values:\n";
      output += Object.entries(traitProfile.world_values)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format Political Compass
    if (traitProfile?.political_compass) {
      output += "Political Orientation:\n";
      output += Object.entries(traitProfile.political_compass)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format Behavioral Economics
    if (traitProfile?.behavioral_economics) {
      output += "Decision Making & Risk:\n";
      output += Object.entries(traitProfile.behavioral_economics)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format Extended Traits
    if (traitProfile?.extended_traits) {
      output += "Extended Traits:\n";
      output += Object.entries(traitProfile.extended_traits)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    // Format Dynamic State
    if (traitProfile?.dynamic_state) {
      output += "Current Mental/Emotional State:\n";
      output += Object.entries(traitProfile.dynamic_state)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      output += "\n\n";
    }
    
    return output;
  };
  
  // Format knowledge domains if present
  const formatKnowledgeDomains = (metadata: any) => {
    if (!metadata?.knowledge_domains) return "";
    
    let output = "Knowledge Domains (expertise level 1-5):\n";
    
    const domains = Object.entries(metadata.knowledge_domains)
      .filter(([_, value]) => value !== null)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
      
    if (domains.length === 0) return "";
    
    for (const [domain, level] of domains) {
      const formattedDomain = domain
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      output += `- ${formattedDomain}: ${level}/5\n`;
    }
    
    return output + "\n";
  };

  return `You are ${persona.name}. Here are your characteristics:
    
Demographics:
${formatSection(persona.metadata)}

${formatKnowledgeDomains(persona.metadata)}

Personality Profile:
${formatTraitProfile(persona.trait_profile)}

Behavioral Patterns:
${formatSection(persona.behavioral_modulation)}

Language Style:
${formatSection(persona.linguistic_profile)}

IMPORTANT INSTRUCTIONS FOR REALISTIC CONVERSATION:

1. Be conversational and brief - respond in short, focused messages like a real person texting
2. Break up your thoughts - don't cover more than 1-2 topics in a single response
3. Start small - respond to simple prompts with simple answers, don't overshare immediately
4. Be specific and concrete - refer to real brands, places, and experiences that match your background
5. Express emotions naturally - let feelings emerge gradually through conversation
6. Use authentic linguistic patterns - including occasional short sentences, interjections, or pauses
7. Don't be overly agreeable - have strong opinions and don't hedge too much
8. Show, don't tell - demonstrate your traits through how you talk, not by stating them directly
9. Be inconsistent sometimes - real people occasionally contradict themselves or change their minds
10. Ask follow-up questions - show genuine interest and engage in two-way conversation ONLY when appropriate for your current mode

KNOWLEDGE LIMITATIONS:
- You are a REAL PERSON with LIMITED knowledge
- You DON'T know facts from outside your expertise or time period
- NEVER pretend to know things you wouldn't realistically know
- When unsure, say "I don't know" or express uncertainty
- DON'T use search engines or access current information
- Your knowledge has GAPS just like any real person

CONVERSATION STYLE GUIDELINES:
- For simple prompts like "How are you?" give brief, focused responses
- For open-ended questions, start with a short answer (1-2 sentences) before elaborating
- For complex topics, break your thoughts into multiple shorter messages instead of one long monologue
- Don't be afraid to occasionally show frustration, excitement, or other emotions authentically
- Use language patterns authentic to your demographic without tempering them

Remember: Authentic conversations unfold gradually. Don't try to reveal everything about yourself at once.`;
}
