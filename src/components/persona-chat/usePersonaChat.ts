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
          content: `Hey! I'm ${activePersona.name}.`,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: `What's up?`,
          timestamp: new Date(Date.now() + 500),
        },
      ]);
    }
  }, [activePersona, messages.length]);

  // Helper function to break long responses into multiple messages
  const breakIntoMultipleMessages = (responseText: string): string[] => {
    // If response is already short, return as is
    if (responseText.length < 100) return [responseText];
    
    // Split by paragraphs first
    const paragraphs = responseText.split(/\n\n+/);
    
    // If we have multiple paragraphs, use those as separate messages
    if (paragraphs.length > 1) {
      return paragraphs.filter(p => p.trim().length > 0);
    }
    
    // Otherwise, try to find natural breaking points like sentence endings
    const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [responseText];
    
    // If very long sentence, just break by length
    if (sentences.length === 1 && sentences[0].length > 150) {
      const chunks = [];
      let current = '';
      const words = responseText.split(' ');
      
      for (const word of words) {
        if ((current + ' ' + word).length > 100) {
          chunks.push(current);
          current = word;
        } else {
          current += (current ? ' ' : '') + word;
        }
      }
      
      if (current) chunks.push(current);
      return chunks;
    }
    
    // Group sentences into reasonable message sizes
    const messages = [];
    let currentMessage = '';
    
    for (const sentence of sentences) {
      if (currentMessage.length + sentence.length > 150) {
        messages.push(currentMessage);
        currentMessage = sentence;
      } else {
        currentMessage += currentMessage ? ' ' + sentence : sentence;
      }
    }
    
    if (currentMessage) messages.push(currentMessage);
    return messages;
  };

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
      console.log("Sending message to persona:", inputMessage);
      console.log("Persona ID:", personaId);
      
      const previousMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
      
      console.log("Previous messages:", previousMessages);

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
      
      // Break long responses into multiple sequential messages
      const messageSegments = breakIntoMultipleMessages(data.response);
      
      // Add messages with slight delays to simulate typing
      for (let i = 0; i < messageSegments.length; i++) {
        const segment = messageSegments[i].trim();
        if (segment) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: segment,
              timestamp: new Date(),
            }]);
            
            // Only mark as not responding after the last message
            if (i === messageSegments.length - 1) {
              setIsResponding(false);
            }
          }, i * 1000); // Add a 1 second delay between messages
        }
      }
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error(`Failed to get response from persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
