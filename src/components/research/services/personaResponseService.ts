
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { ResearchMessage } from '../hooks/types';
import { sendMessageToPersona } from '@/components/persona-chat/api/personaApiService';
import { savePersonaResponse, createPersonaMessage } from './messageService';
import { validatePersonaResponse, ValidationResult } from './personaValidatorService';

export const generatePersonaResponse = async (
  personaId: string,
  sessionId: string,
  currentMessages: ResearchMessage[],
  currentPersonas: Persona[]
): Promise<ResearchMessage | null> => {
  if (!sessionId) {
    console.error('No session ID available');
    return null;
  }

  try {
    console.log('Generating response for persona:', personaId);
    
    const persona = currentPersonas.find(p => p.persona_id === personaId);
    if (!persona) {
      console.error('Persona not found:', personaId);
      toast.error('Selected persona not found');
      return null;
    }

    console.log('Current conversation messages:', currentMessages.length);

    // Build the complete conversation history for context
    const conversationHistory: Message[] = currentMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.timestamp,
      image: m.image
    }));

    console.log('Conversation history being sent:', conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 50)}...`));

    // Create a more natural research prompt that encourages authentic responses
    const naturalResearchPrompt = generateNaturalResearchPrompt(currentMessages, persona);

    // Create enhanced conversation context for research mode
    const researchContext = `This is an authentic research conversation. You should respond naturally as ${persona.name}, not as an AI assistant. Your response length should vary naturally based on your personality, emotional state, and engagement with the topic. Don't worry about being balanced or diplomatic - respond authentically according to your actual beliefs and personality traits.

Key instructions:
- Vary your response length naturally (some responses can be short, others longer)
- Use your authentic speaking style and personality
- Show genuine emotional reactions based on your traits
- Don't feel obligated to give structured, paragraph-formatted responses
- Respond as you naturally would in a real conversation`;

    // Generate initial response
    let response = await sendMessageToPersona(
      personaId,
      naturalResearchPrompt,
      conversationHistory,
      persona,
      'research',
      researchContext,
      currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].image : undefined
    );

    console.log('Initial response generated:', response.substring(0, 100) + '...');

    // Validate and improve response
    const conversationContext = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');
    const lastUserMessage = currentMessages.filter(m => m.role === 'user').pop()?.content || '';
    
    const validationResult: ValidationResult = await validatePersonaResponse(
      response,
      persona,
      conversationContext,
      lastUserMessage
    );

    console.log('Validation scores:', validationResult.scores);
    console.log('Overall authenticity score:', validationResult.scores.overall);

    // Use improved response if available and score is low
    if (validationResult.improvedResponse && validationResult.scores.overall < 0.7) {
      console.log('Using improved response due to low authenticity score');
      response = validationResult.improvedResponse;
    }

    // Log validation results for debugging
    if (validationResult.scores.overall < 0.6) {
      console.warn(`Low authenticity score for ${persona.name}:`, validationResult.feedback);
    }

    // Create persona message
    const assistantMessage = createPersonaMessage(response, personaId);

    // Add validation metadata to message for debugging
    (assistantMessage as any).validation = {
      scores: validationResult.scores,
      feedback: validationResult.feedback
    };

    // Save to database
    await savePersonaResponse(sessionId, personaId, response);

    console.log('Response saved successfully with validation scores');

    return assistantMessage;

  } catch (error) {
    console.error('Error generating persona response:', error);
    toast.error(`Failed to generate response from ${currentPersonas.find(p => p.persona_id === personaId)?.name || 'persona'}`);
    return null;
  }
};

// Generate a more natural research prompt that varies based on conversation context
const generateNaturalResearchPrompt = (messages: ResearchMessage[], persona: Persona): string => {
  if (messages.length === 0) {
    return "Please introduce yourself naturally and share your initial thoughts.";
  }

  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const conversationLength = messages.length;
  
  // Vary prompt style based on conversation progress and persona traits
  const responseVariants = [
    "What's your take on this?",
    "How do you feel about what's been discussed?",
    "What are your thoughts?",
    "What's your perspective here?",
    "How would you respond to this?",
    "What do you think about all this?",
    "What's going through your mind?",
    "How are you processing this conversation?"
  ];

  // If there's a recent user message, respond to it directly
  if (lastUserMessage && messages.indexOf(lastUserMessage) >= messages.length - 3) {
    return `Respond naturally to: "${lastUserMessage.content}"`;
  }

  // For ongoing conversations, use varied prompts
  const randomVariant = responseVariants[Math.floor(Math.random() * responseVariants.length)];
  
  if (conversationLength > 10) {
    return `${randomVariant} Also feel free to build on or challenge what others have said.`;
  } else if (conversationLength > 5) {
    return `${randomVariant} Keep the conversation flowing naturally.`;
  } else {
    return randomVariant;
  }
};
