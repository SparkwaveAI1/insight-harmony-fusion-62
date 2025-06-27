
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { Message } from '@/components/persona-chat/types';
import { ChatMode } from '@/components/persona-chat/ChatModeSelector';

export async function sendMessageToCharacter(
  characterId: string,
  userMessage: string,
  previousMessages: Message[],
  character: Character,
  mode: ChatMode = 'conversation',
  conversationContext: string = '',
  imageData?: string
): Promise<string> {
  console.log('Sending message to character:', { characterId, mode, messageLength: userMessage.length });

  // Convert character to persona format for the API
  const personaData = {
    persona_id: character.character_id,
    name: character.name,
    metadata: character.metadata,
    trait_profile: character.trait_profile,
    behavioral_modulation: character.behavioral_modulation,
    linguistic_profile: character.linguistic_profile,
    emotional_triggers: character.emotional_triggers,
    simulation_directives: character.simulation_directives,
    interview_sections: character.interview_sections,
    prompt: character.prompt
  };

  const { data, error } = await supabase.functions.invoke('openai-proxy', {
    body: {
      persona_id: characterId,
      user_message: userMessage,
      previous_messages: previousMessages,
      persona_data: personaData,
      mode: mode,
      conversation_context: conversationContext,
      image_data: imageData,
      // Enhanced parameters for more authentic responses
      temperature: 0.9,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.4
    }
  });

  if (error) {
    console.error('Error calling OpenAI proxy:', error);
    throw new Error(`Failed to get response: ${error.message}`);
  }

  if (!data?.response) {
    console.error('No response from OpenAI proxy:', data);
    throw new Error('No response received from AI');
  }

  return data.response;
}
