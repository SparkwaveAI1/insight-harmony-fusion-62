
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';
import { Message } from '@/components/persona-chat/types';

export const usePersonaChat = (personaId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const { loadPersona, activePersona, isLoading, error } = usePersona();

  // Load persona on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        await loadPersona(personaId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [personaId, loadPersona]);

  // Add initial greeting once persona is loaded
  useEffect(() => {
    if (activePersona && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm ${activePersona.name}. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [activePersona, messages.length]);

  const handleSendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim() || !activePersona || isResponding) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
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
          persona_id: personaId,
          previous_messages: [
            ...previousMessages,
            { role: 'user', content: inputMessage }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Edge function error (${response.status}):`, errorText);
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Received response from persona:", data.response);
      
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

  return {
    messages,
    isResponding,
    isLoading,
    error,
    activePersona,
    handleSendMessage
  };
};
