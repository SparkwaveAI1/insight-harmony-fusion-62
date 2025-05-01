import { useState } from 'react';
import { toast } from 'sonner';
import { Message } from '../../types';
import { createMessageService } from '../../services/messageService';

interface UseMessageOperationsProps {
  personaAId: string;
  personaBId: string;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
}

export const useMessageOperations = ({
  personaAId,
  personaBId,
  getPersonaName
}: UseMessageOperationsProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  
  const messageService = createMessageService({ 
    setMessages, 
    setIsResponding,
    getPersonaName
  });
  
  const { addMessage, generateResponseFor } = messageService;

  // This function handles sending a user message to the currently set target persona
  const handleUserSendMessage = async (
    userInput: string,
    targetPersona: 'personaA' | 'personaB', 
    getPersonaA: () => any, 
    getPersonaB: () => any,
    setUserInput: (input: string) => void,
    autoChatActive: boolean
  ) => {
    if (!userInput.trim() || isResponding || !getPersonaA() || !getPersonaB()) return;
    
    // Add user message to chat
    addMessage('user', userInput, targetPersona);
    setUserInput('');
    
    // If auto-chat is active, it will continue the conversation
    // Otherwise, generate a single response from the targeted persona
    if (!autoChatActive) {
      try {
        const response = await generateResponseFor(
          targetPersona === 'personaA' ? personaAId : personaBId,
          targetPersona,
          [...messages, { role: 'user', content: userInput, timestamp: new Date(), target: targetPersona }]
        );
        
        addMessage(targetPersona, response);
      } catch (error) {
        console.error('Error generating response to user message:', error);
        toast.error('Failed to get response');
      }
    }
  };
  
  // Direct message sending to a specific persona
  const handleUserSendMessageToTarget = async (
    messageText: string,
    targetPersona: 'personaA' | 'personaB',
    getPersonaA: () => any,
    getPersonaB: () => any,
    autoChatActive: boolean
  ) => {
    if (!messageText.trim() || isResponding || !getPersonaA() || !getPersonaB()) return;
    
    // Add user message to chat with explicit target
    addMessage('user', messageText, targetPersona);
    
    // Generate a response from the targeted persona
    if (!autoChatActive) {
      try {
        const response = await generateResponseFor(
          targetPersona === 'personaA' ? personaAId : personaBId,
          targetPersona,
          [...messages, { role: 'user', content: messageText, timestamp: new Date(), target: targetPersona }]
        );
        
        addMessage(targetPersona, response);
      } catch (error) {
        console.error('Error generating response to direct message:', error);
        toast.error('Failed to get response');
      }
    }
  };

  return {
    messages,
    isResponding,
    setMessages,
    addMessage,
    generateResponseFor,
    handleUserSendMessage,
    handleUserSendMessageToTarget,
  };
};
