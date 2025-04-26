import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import Card from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CornerDownRight, Send } from 'lucide-react';

interface Message {
  role: 'personaA' | 'personaB' | 'user';
  content: string;
  timestamp: Date;
  target?: 'personaA' | 'personaB';
}

const DualChat: React.FC = () => {
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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
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
      // Determine which persona should respond next
      const lastMessage = messages[messages.length - 1];
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dual Persona Chat</h1>
        
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select Personas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Persona A ID</label>
                <Input 
                  value={personaAId} 
                  onChange={(e) => setPersonaAId(e.target.value)}
                  placeholder="Enter Persona ID"
                  disabled={autoChatActive || isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Persona B ID</label>
                <Input 
                  value={personaBId} 
                  onChange={(e) => setPersonaBId(e.target.value)}
                  placeholder="Enter Persona ID"
                  disabled={autoChatActive || isLoading}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleLoadPersonas} 
                disabled={!personaAId || !personaBId || autoChatActive || isLoading}
              >
                Load Personas
              </Button>
            </div>
          </div>
        </Card>
        
        {activePersonas.length === 2 && (
          <Card className="mb-6">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold">Persona A: {getPersonaA()?.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold">Persona B: {getPersonaB()?.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        <Card className="h-[600px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Conversation
              {autoChatActive && <span className="ml-2 text-sm font-normal text-primary">(Conversation in Progress...)</span>}
            </h2>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={handleStartConversation} 
                disabled={activePersonas.length !== 2 || autoChatActive || isResponding}
              >
                Start Conversation
              </Button>
              <Button 
                variant="outline"
                onClick={handleStopConversation} 
                disabled={!autoChatActive}
              >
                Stop Conversation
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`
                  flex 
                  ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                `}>
                  <div className={`
                    max-w-[80%] p-3 rounded-lg
                    ${message.role === 'personaA' ? 'bg-blue-500 text-white' : ''}
                    ${message.role === 'personaB' ? 'bg-green-500 text-white' : ''}
                    ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}
                  `}>
                    {message.role !== 'user' && (
                      <div className="font-semibold mb-1">{getPersonaName(message.role)}</div>
                    )}
                    <p>{message.content}</p>
                    <div className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                      {message.role === 'user' && message.target && (
                        <span className="ml-1">
                          <CornerDownRight className="inline h-3 w-3" /> {getPersonaName(message.target)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isResponding && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <select 
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={targetPersona}
                  onChange={(e) => setTargetPersona(e.target.value as 'personaA' | 'personaB')}
                  disabled={isResponding || activePersonas.length !== 2}
                >
                  <option value="personaA">Send to {getPersonaName('personaA')}</option>
                  <option value="personaB">Send to {getPersonaName('personaB')}</option>
                </select>
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserSendMessage()}
                  placeholder="Type your message..."
                  disabled={isResponding || activePersonas.length !== 2}
                  className="flex-1"
                />
              </div>
              <Button
                onClick={handleUserSendMessage}
                disabled={!userInput.trim() || isResponding || activePersonas.length !== 2}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground text-center">
              {exchangeCount > 0 && (
                <span>Exchange count: {exchangeCount}/{maxExchanges}</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DualChat;
