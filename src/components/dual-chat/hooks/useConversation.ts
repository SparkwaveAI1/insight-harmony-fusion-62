
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Message } from '../types';
import { createMessageService } from '../services/messageService';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [autoChatActive, setAutoChatActive] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isResponding, setIsResponding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoChatRef = useRef<boolean>(false);
  const exchangeCountRef = useRef<number>(0);
  
  // Set refs when state changes
  useEffect(() => {
    autoChatRef.current = autoChatActive;
    exchangeCountRef.current = exchangeCount;
  }, [autoChatActive, exchangeCount]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const messageService = createMessageService({ 
    setMessages, 
    setIsResponding,
    getPersonaName
  });
  
  const { addMessage, generateResponseFor } = messageService;
  
  // This function handles starting the conversation between personas
  const handleStartConversation = async (getPersonaA: () => any, getPersonaB: () => any) => {
    if (isResponding || !getPersonaA() || !getPersonaB()) {
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
  
  // This function handles sending a user message to the currently set target persona
  const handleUserSendMessage = async (
    userInput: string,
    targetPersona: 'personaA' | 'personaB', 
    getPersonaA: () => any, 
    getPersonaB: () => any,
    setUserInput: (input: string) => void
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
  
  // NEW FUNCTION: Direct message sending to a specific persona
  const handleUserSendMessageToTarget = async (
    messageText: string,
    targetPersona: 'personaA' | 'personaB',
    getPersonaA: () => any,
    getPersonaB: () => any
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
    autoChatActive,
    exchangeCount,
    isResponding,
    messagesEndRef,
    handleStartConversation,
    handleStopConversation,
    handleUserSendMessage,
    handleUserSendMessageToTarget, // Export the new function
    setMessages,
  };
};
