import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { Message } from '@/components/persona-chat/types';
import { ChatMode } from '@/components/persona-chat/ChatModeSelector';
import { 
  getOrCompileVoicepack, 
  classifyTurn, 
  planTurn, 
  updateStateFromText,
  serializeVoicepack,
  serializePlan,
  createSystemPrompt,
  pickTempFromTraits,
  pickPresencePenalty,
  pickFrequencyPenalty,
  pickMaxTokens,
  postProcess,
  analyzeResponse
} from '../testing';
import { sendMessageToPersona as sendMessageToPersonaOriginal } from '@/components/persona-chat/api/personaApiService';

export interface VoicepackChatOptions {
  useVoicepack?: boolean;
  state?: Record<string, any>;
  conversationContext?: string;
}

/**
 * Enhanced persona chat service with voicepack integration
 */
export async function sendMessageToPersonaWithVoicepack(
  personaId: string,
  userMessage: string,
  conversationHistory: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  additionalContext: string = '',
  imageData: string | null = null,
  options: VoicepackChatOptions = {}
): Promise<{ response: string; telemetry?: Record<string, any> }> {
  
  const { useVoicepack = true, state = {}, conversationContext = '' } = options;
  
  console.log('🎭 Voicepack Chat: Starting enhanced conversation flow');
  console.log('Settings:', { useVoicepack, personaId, mode });

  try {
    if (useVoicepack) {
      return await voicepackDrivenChat(
        personaId, 
        userMessage, 
        conversationHistory, 
        persona, 
        state, 
        conversationContext,
        additionalContext,
        imageData
      );
    } else {
      // Fallback to traditional persona chat
      const response = await sendMessageToPersonaOriginal(
        personaId,
        userMessage,
        conversationHistory,
        persona,
        mode,
        additionalContext,
        imageData
      );
      return { response };
    }
  } catch (error) {
    console.error('❌ Enhanced persona chat failed:', error);
    // Fallback to traditional chat on error
    console.log('🔄 Falling back to traditional persona chat');
    const response = await sendMessageToPersonaOriginal(
      personaId,
      userMessage,
      conversationHistory,
      persona,
      mode,
      additionalContext,
      imageData
    );
    return { response };
  }
}

/**
 * Single-call voicepack-driven conversation pipeline
 */
async function voicepackDrivenChat(
  personaId: string,
  userMessage: string,
  conversationHistory: Message[],
  persona: Persona,
  state: Record<string, any>,
  conversationContext: string,
  additionalContext: string = '',
  imageData: string | null = null
): Promise<{ response: string; telemetry: Record<string, any> }> {
  
  const startTime = Date.now();
  
  // Step 1: Get or compile voicepack
  console.log('🎭 Step 1: Fetching voicepack');
  const voicepack = await getOrCompileVoicepack(personaId);
  console.log('✅ Voicepack loaded:', Object.keys(voicepack).length, 'properties');
  
  // Step 2: Classify user input
  console.log('🎭 Step 2: Classifying turn');
  const classification = classifyTurn(userMessage);
  console.log('✅ Classification:', classification);
  
  // Step 3: Update state from user input
  console.log('🎭 Step 3: Updating state');
  const updatedState = updateStateFromText(state, userMessage);
  console.log('✅ State updated:', updatedState);
  
  // Step 4: Create execution plan
  console.log('🎭 Step 4: Creating plan');
  const plan = planTurn(classification, voicepack, updatedState);
  console.log('✅ Plan created:', plan);
  
  // Step 5: Single LLM call with voicepack + plan
  console.log('🎭 Step 5: Making LLM call');
  const llmResponse = await makeVoicepackLLMCall(
    userMessage,
    conversationHistory,
    voicepack,
    plan,
    updatedState,
    conversationContext,
    additionalContext,
    imageData
  );
  console.log('✅ LLM response received');
  
  // Step 6: Post-process response
  console.log('🎭 Step 6: Post-processing');
  const finalResponse = postProcess(llmResponse, voicepack, plan);
  console.log('✅ Response post-processed');
  
  // Step 7: Generate telemetry
  const telemetry = {
    ...analyzeResponse(finalResponse, voicepack, plan),
    latency_ms: Date.now() - startTime,
    voicepack_hash: hashVoicepack(voicepack),
    used_voicepack: true,
    classification,
    plan: {
      response_shape: plan.response_shape,
      brevity: plan.brevity,
      style_deltas_count: Object.keys(plan.style_deltas).length
    }
  };
  
  console.log('🎭 Voicepack chat complete. Telemetry:', telemetry);
  
  return {
    response: finalResponse,
    telemetry
  };
}

/**
 * Makes the actual LLM call with voicepack and plan
 */
async function makeVoicepackLLMCall(
  userMessage: string,
  conversationHistory: Message[],
  voicepack: any,
  plan: any,
  state: Record<string, any>,
  conversationContext: string,
  additionalContext: string,
  imageData: string | null
): Promise<string> {
  
  // Prepare messages for LLM
  const messages = [];
  
  // System prompt
  messages.push({
    role: 'system',
    content: createSystemPrompt()
  });
  
  // Developer prompt with voicepack
  messages.push({
    role: 'developer',
    content: `VOICEPACK: ${serializeVoicepack(voicepack)}`
  });
  
  // Conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }
  
  // Additional context if provided
  if (additionalContext || conversationContext) {
    const context = [additionalContext, conversationContext].filter(Boolean).join('\n\n');
    messages.push({
      role: 'system',
      content: `CONTEXT: ${context}`
    });
  }
  
  // User message (potentially with image)
  const userMessageContent = imageData 
    ? `${userMessage}\n[Image attached for analysis]`
    : userMessage;
    
  messages.push({
    role: 'user',
    content: userMessageContent
  });
  
  // Assistant planning prompt
  messages.push({
    role: 'assistant',
    content: `PLAN: ${serializePlan(plan)}\n\nI'll respond according to this plan:`
  });
  
  // Call the LLM via edge function
  const { data, error } = await supabase.functions.invoke('persona-voicepack-chat', {
    body: {
      messages,
      temperature: pickTempFromTraits(state, voicepack),
      presence_penalty: pickPresencePenalty(state, voicepack),
      frequency_penalty: pickFrequencyPenalty(state, voicepack),
      max_tokens: pickMaxTokens(plan, voicepack),
      image_data: imageData
    }
  });
  
  if (error) {
    console.error('❌ Voicepack LLM call failed:', error);
    throw new Error(`LLM call failed: ${error.message}`);
  }
  
  if (!data?.response) {
    throw new Error('No response from LLM');
  }
  
  return data.response;
}

/**
 * Creates a simple hash of the voicepack for telemetry
 */
function hashVoicepack(voicepack: any): string {
  const str = JSON.stringify(voicepack);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Traditional persona chat (fallback) - wrapper for the original function
 */
export async function sendMessageToPersona(
  personaId: string,
  message: string,
  conversationHistory: Message[],
  persona: Persona,
  mode: ChatMode = 'conversation',
  additionalContext: string = '',
  imageData: string | null = null
): Promise<string> {
  console.log('📞 Traditional persona chat API call');
  console.log('Persona:', persona.name);
  console.log('Mode:', mode);
  console.log('Message preview:', message.substring(0, 100));
  console.log('Conversation history length:', conversationHistory.length);
  console.log('Has image:', !!imageData);
  console.log('Additional context length:', additionalContext.length);

  try {
    // Delegate to the original implementation
    return await sendMessageToPersonaOriginal(
      personaId,
      message,
      conversationHistory,
      persona,
      mode,
      additionalContext,
      imageData
    );

  } catch (error) {
    console.error('❌ Traditional persona chat failed:', error);
    throw error;
  }
}