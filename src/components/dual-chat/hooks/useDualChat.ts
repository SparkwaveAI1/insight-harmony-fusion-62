
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
  
  // Updated handler to determine which persona should respond next
  const handleStartConversation = () => {
    // If there are no messages, start with a default conversation
    if (messages.length === 0) {
      return startConversation(getPersonaA, getPersonaB);
    }
    
    // Find the last persona message to determine who should speak next
    const lastMessage = [...messages].reverse().find(
      msg => msg.role === 'personaA' || msg.role === 'personaB'
    );
    
    // If no persona has spoken yet or there's an issue, start with default conversation
    if (!lastMessage) {
      return startConversation(getPersonaA, getPersonaB);
    }
    
    // Determine which persona should respond next
    const nextSpeaker = lastMessage.role === 'personaA' ? 'personaB' : 'personaA';
    
    // Create prompt for the other persona to continue the conversation
    const prompt = `Please continue the conversation.`;
    return userSendMessageToTarget(
      prompt,
      nextSpeaker,
      getPersonaA,
      getPersonaB
    );
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
