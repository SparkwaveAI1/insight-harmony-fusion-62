
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCharacterHook } from './useCharacterHook';
import { Message, ChatMode } from '../types/chatTypes';
import { Character } from '../types/characterTraitTypes';
import { breakIntoMultipleMessages } from '../utils/characterChatUtils';
import { sendMessageToCharacter } from '../api/characterApiService';

export const useCharacterChat = (characterId: string, chatMode: ChatMode = 'conversation') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const { loadCharacter, activeCharacter, isLoading, error } = useCharacterHook();

  // Load character on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        await loadCharacter(characterId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [characterId, loadCharacter]);

  // Add initial greeting once character is loaded
  useEffect(() => {
    if (activeCharacter && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Greetings! I am ${activeCharacter.name}.`,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: `How may I assist you today?`,
          timestamp: new Date(Date.now() + 500),
        },
      ]);
    }
  }, [activeCharacter, messages.length]);

  const handleSendMessage = async (inputMessage: string, imageFile: File | null = null) => {
    if ((!inputMessage.trim() && !imageFile) || !activeCharacter || isResponding) return;

    let imageBase64: string | undefined;
    
    if (imageFile) {
      try {
        imageBase64 = await convertFileToBase64(imageFile);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        toast.error('Failed to process image');
        return;
      }
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      image: imageBase64,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      console.log("Chat Mode:", chatMode);
      console.log("Conversation Context:", conversationContext);
      console.log("Sending message with image:", !!imageBase64);
      
      const response = await sendMessageToCharacter(
        characterId,
        inputMessage,
        messages,
        activeCharacter,
        chatMode,
        conversationContext,
        imageBase64
      );
      
      // Break long responses into multiple sequential messages
      const messageSegments = breakIntoMultipleMessages(response);
      
      // Add messages with slight delays to simulate typing
      for (let i = 0; i < messageSegments.length; i++) {
        const segment = messageSegments[i].trim();
        if (segment) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: segment,
              timestamp: new Date(),
            }]);
            
            // Only mark as not responding after the last message
            if (i === messageSegments.length - 1) {
              setIsResponding(false);
            }
          }, i * 1000); // Add a 1 second delay between messages
        }
      }
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error(`Failed to get response from character: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsResponding(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return {
    messages,
    isResponding,
    isLoading,
    error,
    activeCharacter,
    handleSendMessage,
    setConversationContext
  };
};
