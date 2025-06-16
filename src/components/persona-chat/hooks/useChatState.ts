
import { useState, useCallback } from 'react';
import { Message } from '@/components/persona-chat/types';
import { toast } from 'sonner';

export interface ChatState {
  messages: Message[];
  isResponding: boolean;
  conversationContext: string;
}

export interface ChatActions {
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setIsResponding: (responding: boolean) => void;
  setConversationContext: (context: string) => void;
  clearMessages: () => void;
  resetState: () => void;
}

export const useChatState = (initialMessages: Message[] = []) => {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isResponding: false,
    conversationContext: '',
  });

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  const addMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, ...messages]
    }));
  }, []);

  const setIsResponding = useCallback((responding: boolean) => {
    setState(prev => ({
      ...prev,
      isResponding: responding
    }));
  }, []);

  const setConversationContext = useCallback((context: string) => {
    setState(prev => ({
      ...prev,
      conversationContext: context
    }));
    if (context) {
      toast.success("Conversation context updated");
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      messages: initialMessages,
      isResponding: false,
      conversationContext: '',
    });
  }, [initialMessages]);

  const actions: ChatActions = {
    addMessage,
    addMessages,
    setIsResponding,
    setConversationContext,
    clearMessages,
    resetState,
  };

  return {
    ...state,
    actions,
  };
};
