
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
  console.log('Character Creation Source:', character.creation_source);
  console.log('Has Image:', !!imageBase64);

  try {
    // Route to appropriate response function based on character type
    const isCreativeCharacter = character.creation_source === 'creative';
    const functionName = isCreativeCharacter ? 'generate-creative-character-response' : 'generate-character-response';
    
    console.log(`Routing to ${functionName} for ${isCreativeCharacter ? 'creative' : 'historical'} character`);

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        character,
        message,
        conversationContext,
        chatMode,
        messageHistory: messageHistory.map(m => ({
          role: m.role,
          content: m.content
        })),
        imageBase64,
        has_image: !!imageBase64
      }
    });

    if (error) {
      console.error(`❌ Error from ${functionName}:`, error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }

    if (!data?.response) {
      console.error('❌ No response received from character');
      throw new Error('No response received from character');
    }

    console.log(`✅ ${isCreativeCharacter ? 'Creative' : 'Historical'} character response received`);
    return data.response;
  } catch (error) {
    console.error('❌ Error in sendMessageToCharacter:', error);
    throw error;
  }
};
