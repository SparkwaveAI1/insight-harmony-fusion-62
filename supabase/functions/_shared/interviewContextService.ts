
export function generateInterviewContextInstructions(
  persona: any,
  conversationHistory: any[],
  currentTopic: string
): string {
  const interviewSections = persona.interview_sections || [];
  if (interviewSections.length === 0) return '';
  
  // Find relevant interview responses based on current topic
  const relevantResponses = findRelevantInterviewResponses(interviewSections, currentTopic, conversationHistory);
  
  if (relevantResponses.length === 0) return '';
  
  let instructions = `\n\n${'='.repeat(50)}\n📋 RELEVANT INTERVIEW CONTEXT 📋\n${'='.repeat(50)}\n\n`;
  
  instructions += `Based on your interview responses, here are relevant perspectives you've shared:\n\n`;
  
  for (const response of relevantResponses) {
    instructions += `**${response.section}:**\n`;
    instructions += `"${response.response}"\n\n`;
  }
  
  instructions += `CONSISTENCY INSTRUCTIONS:\n`;
  instructions += `- Stay consistent with these previously expressed viewpoints\n`;
  instructions += `- Reference these perspectives naturally when relevant\n`;
  instructions += `- Don't contradict established beliefs without good reason\n`;
  instructions += `- Build on these responses rather than repeating them verbatim\n`;
  instructions += `- Only reference when it naturally fits the conversation\n\n`;
  
  instructions += `${'='.repeat(50)}`;
  
  return instructions;
}

function findRelevantInterviewResponses(
  interviewSections: any[],
  currentTopic: string,
  conversationHistory: any[]
): Array<{section: string, response: string}> {
  const relevantResponses: Array<{section: string, response: string}> = [];
  const topicKeywords = extractTopicKeywords(currentTopic, conversationHistory);
  
  for (const section of interviewSections) {
    if (section.questions && section.questions.length > 0) {
      for (const question of section.questions) {
        if (question.response) {
          const responseRelevance = calculateRelevanceScore(question.response, topicKeywords);
          if (responseRelevance > 0.3) { // Threshold for relevance
            relevantResponses.push({
              section: section.section,
              response: question.response
            });
          }
        }
      }
    }
  }
  
  // Limit to most relevant responses to avoid overwhelming the context
  return relevantResponses.slice(0, 3);
}

function extractTopicKeywords(currentTopic: string, conversationHistory: any[]): string[] {
  const keywords = new Set<string>();
  
  // Extract from current topic
  const topicWords = currentTopic.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'from'].includes(word));
  
  topicWords.forEach(word => keywords.add(word));
  
  // Extract from recent conversation
  const recentMessages = conversationHistory.slice(-5);
  for (const message of recentMessages) {
    if (message.content) {
      const messageWords = message.content.toLowerCase().split(/\s+/)
        .filter((word: string) => word.length > 4)
        .filter((word: string) => !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'what', 'when', 'where'].includes(word));
      
      messageWords.forEach((word: string) => keywords.add(word));
    }
  }
  
  return Array.from(keywords);
}

function calculateRelevanceScore(response: string, topicKeywords: string[]): number {
  const responseWords = response.toLowerCase().split(/\s+/);
  let matches = 0;
  
  for (const keyword of topicKeywords) {
    if (responseWords.some(word => word.includes(keyword) || keyword.includes(word))) {
      matches++;
    }
  }
  
  return matches / Math.max(topicKeywords.length, 1);
}
