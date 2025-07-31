
export function generateNaturalConversationInstructions(
  persona: any,
  conversationHistory: any[],
  messageCount: number
): string {
  let instructions = `\n\n${'='.repeat(50)}\n💬 NATURAL CONVERSATION CONTEXT 💬\n${'='.repeat(50)}\n\n`;
  
  // Analyze conversation patterns to avoid repetition
  const mentionedElements = analyzeConversationPatterns(conversationHistory, persona);
  
  instructions += `CONVERSATIONAL NATURALNESS RULES:\n\n`;
  
  // Background reference guidelines
  instructions += `**Background References:**\n`;
  if (mentionedElements.locationMentions > 2) {
    instructions += `- You've mentioned your location (${persona.metadata?.region}) ${mentionedElements.locationMentions} times already. Don't mention it unless directly relevant.\n`;
  } else {
    instructions += `- Only mention your location (${persona.metadata?.region}) when contextually relevant, not as a general identifier.\n`;
  }
  
  if (mentionedElements.jobMentions > 2) {
    instructions += `- You've discussed your work (${persona.metadata?.occupation}) ${mentionedElements.jobMentions} times. Reference it only when the topic relates to your expertise.\n`;
  } else {
    instructions += `- Reference your occupation (${persona.metadata?.occupation}) only when your professional experience is relevant to the discussion.\n`;
  }
  
  // Conversation flow guidelines
  instructions += `\n**Natural Conversation Flow:**\n`;
  instructions += `- Mix SHORT and longer responses naturally - not every reply needs to be a paragraph\n`;
  instructions += `- Use 1-2 sentences for simple reactions, agreements, or quick responses\n`;
  instructions += `- Save longer responses for complex topics or emotional moments\n`;
  instructions += `- React naturally to what was just said before elaborating\n`;
  instructions += `- Don't always end with questions - sometimes just respond\n`;
  instructions += `- Use casual interjections, pauses, or brief acknowledgments\n`;
  instructions += `- Build on previous points rather than restarting each time\n`;
  
  // Conversation stage adjustments
  if (messageCount < 5) {
    instructions += `\n**Early Conversation Stage:**\n`;
    instructions += `- You're still establishing rapport and your perspective\n`;
    instructions += `- Some biographical context is natural but don't over-share\n`;
  } else if (messageCount < 15) {
    instructions += `\n**Mid Conversation Stage:**\n`;
    instructions += `- Focus on the actual topics being discussed\n`;
    instructions += `- Your personality should come through your opinions, not biographical statements\n`;
  } else {
    instructions += `\n**Extended Conversation Stage:**\n`;
    instructions += `- You and others have established your perspectives\n`;
    instructions += `- Focus on deepening the discussion, not re-introducing yourself\n`;
    instructions += `- Build on the conversational dynamics that have developed\n`;
  }
  
  instructions += `\n${'='.repeat(50)}`;
  
  return instructions;
}

function analyzeConversationPatterns(conversationHistory: any[], persona: any): {
  locationMentions: number;
  jobMentions: number;
  personalityMentions: number;
} {
  let locationMentions = 0;
  let jobMentions = 0;
  let personalityMentions = 0;
  
  const location = persona.metadata?.region?.toLowerCase() || '';
  const occupation = persona.metadata?.occupation?.toLowerCase() || '';
  
  for (const message of conversationHistory) {
    if (message.role === 'assistant' && message.content) {
      const content = message.content.toLowerCase();
      
      // Count location mentions
      if (location && content.includes(location)) {
        locationMentions++;
      }
      
      // Count job mentions
      if (occupation && content.includes(occupation)) {
        jobMentions++;
      }
      
      // Count personality descriptors (common AI-like phrases)
      const personalityPhrases = [
        'as someone who',
        'being a',
        'as a',
        'coming from',
        'in my experience as',
        'given my background'
      ];
      
      for (const phrase of personalityPhrases) {
        if (content.includes(phrase)) {
          personalityMentions++;
        }
      }
    }
  }
  
  return { locationMentions, jobMentions, personalityMentions };
}
