
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Message } from '../../types';

interface UseConversationFlowProps {
  maxExchanges: number;
  addMessage: (role: 'personaA' | 'personaB' | 'user', content: string, target?: 'personaA' | 'personaB') => Message;
  generateResponseFor: (personaId: string, personaRole: 'personaA' | 'personaB', previousMessages: Message[]) => Promise<string>;
  messages: Message[];
  personaAId: string;
  personaBId: string;
}

export const useConversationFlow = ({
  maxExchanges,
  addMessage,
  generateResponseFor,
  messages,
  personaAId,
  personaBId
}: UseConversationFlowProps) => {
  const [autoChatActive, setAutoChatActive] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  
  const autoChatRef = useRef<boolean>(false);
  const exchangeCountRef = useRef<number>(0);
  
  // Set refs when state changes
  useEffect(() => {
    autoChatRef.current = autoChatActive;
    exchangeCountRef.current = exchangeCount;
  }, [autoChatActive, exchangeCount]);
  
  // This function handles starting the conversation between personas
  const handleStartConversation = async (getPersonaA: () => any, getPersonaB: () => any) => {
    if (!getPersonaA() || !getPersonaB()) {
      toast.error('Please load both personas first');
      return;
    }
    
    setAutoChatActive(true);
    
    // Start with persona A if there are no messages yet
    if (messages.length === 0) {
      const personaA = getPersonaA();
      const greeting = `Hello, my name is ${personaA?.name}. It's nice to meet you.`;
      addMessage('personaA', greeting);
      
      // Allow some time for the UI to update before continuing the conversation
      setTimeout(() => {
        continueConversation(getPersonaA, getPersonaB);
      }, 1000);
    } else {
      continueConversation(getPersonaA, getPersonaB);
    }
  };
  
  const continueConversation = async (getPersonaA: () => any, getPersonaB: () => any) => {
    // Check if we should stop
    if (!autoChatRef.current || exchangeCountRef.current >= maxExchanges) {
      if (exchangeCountRef.current >= maxExchanges) {
        toast.info(`Conversation automatically stopped after ${maxExchanges} exchanges`);
        setAutoChatActive(false);
      }
      return;
    }

    try {
      // Check if messages array is empty
      if (messages.length === 0) {
        console.error("No messages to continue conversation");
        return;
      }
      
      // Determine which persona should respond next based on the last message
      const lastMessage = messages[messages.length - 1];
      
      // Ensure lastMessage exists and has a role before continuing
      if (!lastMessage || !lastMessage.role) {
        console.error("Invalid last message:", lastMessage);
        toast.error("Error in conversation flow: invalid message");
        setAutoChatActive(false);
        return;
      }
      
      // The next responder should always be the persona who didn't speak last
      const respondingPersona = lastMessage.role === 'personaA' ? 'personaB' : 'personaA';
      
      // Generate response with full conversation context
      const response = await generateResponseFor(
        respondingPersona === 'personaA' ? personaAId : personaBId,
        respondingPersona,
        messages
      );
      
      // Add response to messages
      addMessage(respondingPersona, response);
      
      // Increment exchange counter if we've completed a back-and-forth
      if (respondingPersona === 'personaB') {
        setExchangeCount(prevCount => prevCount + 1);
      }
      
      // Continue conversation after a short delay
      setTimeout(() => {
        continueConversation(getPersonaA, getPersonaB);
      }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
      
    } catch (error) {
      console.error('Error continuing conversation:', error);
      toast.error('Error in conversation flow');
      setAutoChatActive(false);
    }
  };
  
  const handleStopConversation = () => {
    setAutoChatActive(false);
    toast.info('Conversation stopped');
  };

  return {
    autoChatActive,
    exchangeCount,
    handleStartConversation,
    handleStopConversation,
  };
};
