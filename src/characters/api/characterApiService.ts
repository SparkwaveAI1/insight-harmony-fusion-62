
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { Message } from '../types/chatTypes';

export const sendMessageToCharacter = async (
  characterId: string,
  message: string,
  messageHistory: Message[],
  character: Character,
  chatMode: string,
  conversationContext: string,
  imageBase64?: string
): Promise<string> => {
  console.log('=== SENDING MESSAGE TO CHARACTER ===');
  console.log('Character ID:', characterId);
  console.log('Message:', message);
  console.log('Chat Mode:', chatMode);
  console.log('Has Image:', !!imageBase64);

  try {
    const { data, error } = await supabase.functions.invoke('generate-character-response', {
      body: {
        character,
        message,
        conversationContext,
        chatMode,
        messageHistory: messageHistory.map(m => ({
          role: m.role,
          content: m.content
        })),
        imageBase64
      }
    });

    if (error) {
      console.error('❌ Error from character response function:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }

    if (!data?.response) {
      console.error('❌ No response received from character');
      throw new Error('No response received from character');
    }

    console.log('✅ Character response received');
    return data.response;
  } catch (error) {
    console.error('❌ Error in sendMessageToCharacter:', error);
    throw error;
  }
};
