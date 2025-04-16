
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPersonaByPersonaId } from '@/services/persona/personaService';
import { Persona } from '@/services/persona/types';
import Card from '@/components/ui-custom/Card';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersonaChatInterfaceProps {
  personaId: string;
}

const PersonaChatInterface = ({ personaId }: PersonaChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const loadPersona = async () => {
      try {
        const personaData = await getPersonaByPersonaId(personaId);
        if (personaData) {
          console.log("Loaded persona:", personaData.name);
          setPersona(personaData);
          setMessages([
            {
              role: 'assistant',
              content: `Hello! I'm ${personaData.name}. How can I help you today?`,
              timestamp: new Date(),
            },
          ]);
        } else {
          toast.error('Could not load persona data');
        }
      } catch (error) {
        console.error('Error loading persona:', error);
        toast.error('Failed to load persona data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPersona();
  }, [personaId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !persona || isResponding) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsResponding(true);

    try {
      const previousMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      console.log("Sending message to persona:", inputMessage);
      
      const response = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/generate-persona-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
        },
        body: JSON.stringify({
          message: inputMessage,
          persona: persona,
          previousMessages: previousMessages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Edge function error (${response.status}):`, errorText);
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Received response from persona");
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Failed to get response from persona');
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <ChatMessages messages={messages} isResponding={isResponding} />
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isResponding={isResponding}
      />
    </Card>
  );
};

export default PersonaChatInterface;
