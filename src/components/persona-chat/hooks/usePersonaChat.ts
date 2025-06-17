
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import { Message } from '@/components/persona-chat/types';
import { ChatMode } from '../ChatModeSelector';
import { MessageFormattingService } from '@/services/messageFormattingService';
import { sendMessageToPersona } from '../api/personaApiService';
import { useChatState } from './useChatState';

export const usePersonaChat = (personaId: string, chatMode: ChatMode = 'conversation') => {
  const { loadPersona, activePersona, isLoading, error } = usePersona();
  const chatState = useChatState();

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
    if (activePersona && chatState.messages.length === 0) {
      const greetingMessages: Message[] = [
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
      ];
      chatState.actions.addMessages(greetingMessages);
    }
  }, [activePersona, chatState.messages.length, chatState.actions]);

  const handleSendMessage = useCallback(async (inputMessage: string, file: File | null = null) => {
    if ((!inputMessage.trim() && !file) || !activePersona || chatState.isResponding) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      file: file || undefined,
    };

    chatState.actions.addMessage(userMessage);
    chatState.actions.setIsResponding(true);

    try {
      console.log("Chat Mode:", chatMode);
      console.log("File attached:", file ? `${file.name} (${file.type})` : 'None');
      
      const response = await sendMessageToPersona({
        personaId,
        message: inputMessage,
        messageHistory: chatState.messages,
        persona: activePersona,
        file: file || undefined,
        chatMode
      });
      
      // Break long responses into multiple sequential messages
      const messageSegments = MessageFormattingService.breakIntoMultipleMessages(response);
      
      // Add messages with slight delays to simulate typing
      for (let i = 0; i < messageSegments.length; i++) {
        const segment = messageSegments[i].trim();
        if (segment) {
          setTimeout(() => {
            chatState.actions.addMessage({
              role: 'assistant',
              content: segment,
              timestamp: new Date(),
            });
            
            // Only mark as not responding after the last message
            if (i === messageSegments.length - 1) {
              chatState.actions.setIsResponding(false);
            }
          }, i * 1000); // Add a 1 second delay between messages
        }
      }
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error(`Failed to get response from persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
      chatState.actions.setIsResponding(false);
    }
  }, [personaId, chatMode, activePersona, chatState.messages, chatState.isResponding, chatState.actions]);

  return {
    messages: chatState.messages,
    isResponding: chatState.isResponding,
    conversationContext: chatState.conversationContext,
    isLoading,
    error,
    activePersona,
    handleSendMessage,
    setConversationContext: chatState.actions.setConversationContext,
    chatActions: chatState.actions,
  };
};
