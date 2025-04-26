
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import { Message } from './types';

export const useDualChat = () => {
  const [personaAId, setPersonaAId] = useState('');
  const [personaBId, setPersonaBId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [targetPersona, setTargetPersona] = useState<'personaA' | 'personaB'>('personaA');
  const [autoChatActive, setAutoChatActive] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isResponding, setIsResponding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoChatRef = useRef<boolean>(false);
  const exchangeCountRef = useRef<number>(0);
  const maxExchanges = 50;
  
  const { loadPersona, loadMultiplePersonas, activePersonas, isLoading, error, clearPersonas } = usePersona();
  
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
  
  const handleLoadPersonas = async () => {
    if (!personaAId || !personaBId) {
      toast.error('Please enter both persona IDs');
      return;
    }
    
    if (personaAId === personaBId) {
      toast.error('Please select two different personas');
      return;
    }
    
    try {
      clearPersonas(); // Clear any previously loaded personas
      await loadMultiplePersonas([personaAId, personaBId]);
      toast.success('Personas loaded successfully');
      
      // Reset conversation
      setMessages([]);
      setExchangeCount(0);
      setAutoChatActive(false);
    } catch (error) {
      console.error('Failed to load personas:', error);
      toast.error('Failed to load one or both personas');
    }
  };
  
  const getPersonaA = () => {
    return activePersonas[0] || null;
  };
  
  const getPersonaB = () => {
    return activePersonas[1] || null;
  };
  
  const generatePersonaResponse = async (
    personaId: string, 
    personaRole: 'personaA' | 'personaB',
    previousMessages: any[]
  ) => {
    try {
      setIsResponding(true);
      
      // Format previous messages for the API
      const formattedMessages = previousMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
      
      const persona = personaRole === 'personaA' ? getPersonaA() : getPersonaB();
      
      if (!persona) {
        throw new Error(`${personaRole === 'personaA' ? 'First' : 'Second'} persona not loaded`);
      }
      
      console.log(`Generating response for ${persona.name}...`);
      
      // Call the Supabase edge function to generate a response
      const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
        },
        body: JSON.stringify({
          message: formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1].content : "Hello",
          persona: persona,
          previousMessages: formattedMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      return `Error generating response: ${error.message}`;
    } finally {
      setIsResponding(false);
    }
  };
  
  const addMessage = (role: 'personaA' | 'personaB' | 'user', content: string, target?: 'personaA' | 'personaB') => {
    const newMessage = {
      role,
      content,
      timestamp: new Date(),
      target
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };
  
  const handleStartConversation = async () => {
    if (isLoading || !getPersonaA() || !getPersonaB()) {
      toast.error('Please load both personas first');
      return;
    }
    
    setAutoChatActive(true);
    setExchangeCount(0);
    
    // Start with persona A if there are no messages yet
    if (messages.length === 0) {
      const personaA = getPersonaA();
      const greeting = `Hello, my name is ${personaA?.name}. It's nice to meet you.`;
      addMessage('personaA', greeting);
      
      // Allow some time for the UI to update before continuing the conversation
      setTimeout(() => {
        continueConversation();
      }, 1000);
    } else {
      continueConversation();
    }
  };
  
  const continueConversation = async () => {
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
      
      const respondingPersona = lastMessage.role === 'personaA' || (lastMessage.role === 'user' && lastMessage.target === 'personaA') 
        ? 'personaB' : 'personaA';
      
      // Generate response
      const response = await generatePersonaResponse(
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
        continueConversation();
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
  
  const handleUserSendMessage = async () => {
    if (!userInput.trim() || isResponding || !getPersonaA() || !getPersonaB()) return;
    
    // Add user message to chat
    addMessage('user', userInput, targetPersona);
    setUserInput('');
    
    // If auto-chat is active, it will continue the conversation
    // Otherwise, generate a single response from the targeted persona
    if (!autoChatActive) {
      try {
        const response = await generatePersonaResponse(
          targetPersona === 'personaA' ? personaAId : personaBId,
          targetPersona,
          [...messages, { role: 'user', content: userInput }] 
        );
        
        addMessage(targetPersona, response);
      } catch (error) {
        console.error('Error generating response to user message:', error);
        toast.error('Failed to get response');
      }
    }
  };
  
  const getPersonaName = (type: 'personaA' | 'personaB') => {
    const persona = type === 'personaA' ? getPersonaA() : getPersonaB();
    return persona?.name || type;
  };

  return {
    personaAId,
    personaBId,
    messages,
    userInput,
    targetPersona,
    autoChatActive,
    exchangeCount,
    isResponding,
    maxExchanges,
    isLoading,
    activePersonas,
    messagesEndRef,
    setPersonaAId,
    setPersonaBId,
    setUserInput,
    setTargetPersona,
    handleLoadPersonas,
    handleStartConversation,
    handleStopConversation,
    handleUserSendMessage,
    getPersonaA,
    getPersonaB,
    getPersonaName,
  };
};

export default useDualChat;
