
import { useRef } from 'react';
import { useMessageOperations } from './messages/useMessageOperations';
import { useConversationFlow } from './conversation/useConversationFlow';
import { Message } from '../types';

interface UseConversationProps {
  personaAId: string;
  personaBId: string;
  maxExchanges: number;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
}

export const useConversation = ({
  personaAId,
  personaBId,
  maxExchanges,
  getPersonaName
}: UseConversationProps) => {
  // Message operations
  const {
    messages,
    isResponding,
    setMessages,
    addMessage,
    generateResponseFor,
    handleUserSendMessage: userSendMessage,
    handleUserSendMessageToTarget: userSendMessageToTarget
  } = useMessageOperations({
    personaAId,
    personaBId,
    getPersonaName
  });
  
  // Conversation flow
  const {
    autoChatActive,
    exchangeCount,
    handleStartConversation: startConversation,
    handleStopConversation
  } = useConversationFlow({
    maxExchanges,
    addMessage,
    generateResponseFor,
    messages,
    personaAId,
    personaBId
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Wrapper for user send message that includes autoChatActive
  const handleUserSendMessage = (
    userInput: string,
    targetPersona: 'personaA' | 'personaB', 
    getPersonaA: () => any, 
    getPersonaB: () => any,
    setUserInput: (input: string) => void
  ) => {
    return userSendMessage(
      userInput,
      targetPersona,
      getPersonaA,
      getPersonaB,
      setUserInput,
      autoChatActive
    );
  };
  
  // Wrapper for direct message to target
  const handleUserSendMessageToTarget = (
    messageText: string,
    targetPersona: 'personaA' | 'personaB',
    getPersonaA: () => any,
    getPersonaB: () => any
  ) => {
    return userSendMessageToTarget(
      messageText,
      targetPersona,
      getPersonaA,
      getPersonaB,
      autoChatActive
    );
  };
  
  // Wrapper for starting conversation
  const handleStartConversation = (getPersonaA: () => any, getPersonaB: () => any) => {
    return startConversation(getPersonaA, getPersonaB);
  };

  return {
    messages,
    autoChatActive,
    exchangeCount,
    isResponding,
    messagesEndRef,
    handleStartConversation,
    handleStopConversation,
    handleUserSendMessage,
    handleUserSendMessageToTarget,
    setMessages,
  };
};
