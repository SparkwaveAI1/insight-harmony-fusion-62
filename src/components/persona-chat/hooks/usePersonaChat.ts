
import { useState, useEffect, useCallback } from 'react';
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

  const handleSendMessage = async (inputMessage: string, file: File | null = null) => {
    if ((!inputMessage.trim() && !file) || !activePersona || isResponding) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      file: file || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      console.log("Chat Mode:", chatMode);
      console.log("File attached:", file ? `${file.name} (${file.type})` : 'None');
      
      const response = await sendMessageToPersona({
        personaId,
        message: inputMessage,
        messageHistory: messages,
        persona: activePersona,
        file: file || undefined
      });
      
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
      toast.error(`Failed to get response from persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsResponding(false);
    }
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
