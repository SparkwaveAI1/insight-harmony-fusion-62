
import { useState, useCallback, useEffect } from 'react';
import { Character } from '../types/characterTraitTypes';
import { getCharacterById, getCharacterByCharacterId } from '../services/characterService';
import { Message, ChatMode } from '../types/chatTypes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useCharacterChat = (characterId: string, chatMode: ChatMode) => {
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<string>('');

  // Load character when hook initializes
  const loadCharacter = useCallback(async () => {
    console.log('=== LOADING CHARACTER FOR CHAT ===');
    console.log('Character ID:', characterId);
    
    setIsLoading(true);
    setError(null);
    
    try {
      let character: Character | null = null;
      
      // Try to load by character_id first, then by id
      character = await getCharacterByCharacterId(characterId);
      
      if (!character) {
        character = await getCharacterById(characterId);
      }
      
      if (!character) {
        throw new Error('Character not found');
      }
      
      setActiveCharacter(character);
      console.log('✅ Character loaded for chat:', character.name);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load character';
      console.error('Error loading character for chat:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  const handleSendMessage = useCallback(async (messageContent: string, imageFile: File | null = null) => {
    if (!activeCharacter || !messageContent.trim()) return;

    console.log('=== SENDING CHARACTER CHAT MESSAGE ===');
    console.log('Character:', activeCharacter.name);
    console.log('Message:', messageContent);
    console.log('Chat Mode:', chatMode);

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      image: imageFile ? URL.createObjectURL(imageFile) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      // Call the character-specific response function
      const { data, error } = await supabase.functions.invoke('generate-character-response', {
        body: {
          character: activeCharacter,
          message: messageContent,
          conversationContext,
          chatMode,
          messageHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) {
        console.error('❌ Error generating character response:', error);
        throw new Error(`Failed to generate response: ${error.message}`);
      }

      if (!data?.response) {
        console.error('❌ No response received from character');
        throw new Error('No response received from character');
      }

      console.log('✅ Character response received');

      // Add character response to chat
      const characterMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, characterMessage]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error in character chat:', error);
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorResponse: Message = {
        role: 'assistant',
        content: `I apologize, but I'm having trouble responding right now. Please try again in a moment.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsResponding(false);
    }
  }, [activeCharacter, conversationContext, chatMode, messages]);

  return {
    activeCharacter,
    messages,
    isLoading,
    isResponding,
    error,
    handleSendMessage,
    setConversationContext
  };
};
