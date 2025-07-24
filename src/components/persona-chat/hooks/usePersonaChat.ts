import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';
import { ChatMode } from '../ChatModeSelector';
import { breakIntoMultipleMessages } from '../utils/chatMessageUtils';
import { sendMessageToPersona } from '../api/personaApiService';

export const usePersonaChat = (personaId: string, chatMode: ChatMode = 'conversation') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const { loadPersona, activePersona, isLoading, error } = usePersona();

  // Load persona on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        await loadPersona(personaId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [personaId, loadPersona]);

  // Add initial greeting once persona is loaded
  useEffect(() => {
    if (activePersona && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm ${activePersona.name}.`,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: `What's up?`,
          timestamp: new Date(Date.now() + 500),
        },
      ]);
    }
  }, [activePersona, messages.length]);

  const handleSendMessage = async (inputMessage: string, imageFile: File | null = null) => {
    if ((!inputMessage.trim() && !imageFile) || !activePersona || isResponding) return;

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
      
      const response = await sendMessageToPersona(
        personaId,
        inputMessage,
        messages,
        activePersona,
        chatMode,
        conversationContext,
        imageBase64
      );
      
      // For 1-on-1 chat: Return complete response immediately for better UX
      // Only break into segments if extremely long (>800 chars)
      if (response.length > 800) {
        const messageSegments = breakIntoMultipleMessages(response);
        
        // Add messages with shorter delays for better flow
        for (let i = 0; i < messageSegments.length; i++) {
          const segment = messageSegments[i].trim();
          if (segment) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: segment,
                timestamp: new Date(),
              }]);
              
              if (i === messageSegments.length - 1) {
                setIsResponding(false);
              }
            }, i * 200); // Reduced from 1000ms to 200ms
          }
        }
      } else {
        // Single message - no artificial delay
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }]);
        setIsResponding(false);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error(`Failed to get response from persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    activePersona,
    handleSendMessage,
    setConversationContext
  };
};
