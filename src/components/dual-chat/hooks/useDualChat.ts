
import { useState } from 'react';
import { usePersonaSelection } from './usePersonaSelection';
import { useConversation } from './useConversation';

export const useDualChat = () => {
  const [userInput, setUserInput] = useState('');
  const [targetPersona, setTargetPersona] = useState<'personaA' | 'personaB'>('personaA');
  const maxExchanges = 50;
  
  const {
    personaAId,
    personaBId,
    setPersonaAId,
    setPersonaBId,
    handleLoadPersonas,
    getPersonaA,
    getPersonaB,
    getPersonaName,
    activePersonas,
    isLoading
  } = usePersonaSelection();
  
  const {
    messages,
    autoChatActive,
    exchangeCount,
    isResponding,
    messagesEndRef,
    handleStartConversation: startConversation,
    handleStopConversation,
    handleUserSendMessage: userSendMessage,
    handleUserSendMessageToTarget: userSendMessageToTarget,
    setMessages
  } = useConversation({
    personaAId,
    personaBId,
    maxExchanges,
    getPersonaName
  });
  
  // Wrapper functions that provide the necessary dependencies
  const handleStartConversation = () => {
    return startConversation(getPersonaA, getPersonaB);
  };
  
  // Regular message send function
  const handleUserSendMessage = () => {
    return userSendMessage(
      userInput,
      targetPersona,
      getPersonaA,
      getPersonaB,
      setUserInput
    );
  };
  
  // New function to handle direct messaging to a specific target
  const handleUserSendMessageToTarget = (message: string, target: 'personaA' | 'personaB') => {
    return userSendMessageToTarget(
      message,
      target,
      getPersonaA,
      getPersonaB
    );
  };

  return {
    // Persona selection
    personaAId,
    personaBId,
    setPersonaAId,
    setPersonaBId,
    handleLoadPersonas,
    getPersonaA,
    getPersonaB,
    getPersonaName,
    activePersonas,
    isLoading,
    
    // User input
    userInput,
    setUserInput,
    targetPersona,
    setTargetPersona,
    
    // Conversation
    messages,
    autoChatActive,
    exchangeCount,
    isResponding,
    maxExchanges,
    messagesEndRef,
    handleStartConversation,
    handleStopConversation,
    handleUserSendMessage,
    handleUserSendMessageToTarget,
  };
};

export default useDualChat;
