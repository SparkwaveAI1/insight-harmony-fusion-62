
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResearchMessageInput } from './ResearchMessageInput';
import { ResearchMessage } from './ResearchMessage';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

interface ResearchConversationProps {
  messages: (Message & { responding_persona_id?: string })[];
  loadedPersonas: Persona[];
  isLoading: boolean;
  onSendMessage: (message: string, imageFile?: File | null) => void;
  onSelectResponder: (personaId: string) => void;
}

export const ResearchConversation: React.FC<ResearchConversationProps> = ({
  messages,
  loadedPersonas,
  isLoading,
  onSendMessage,
  onSelectResponder
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPersonaInfo = (personaId: string) => {
    return loadedPersonas.find(p => p.persona_id === personaId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Central Chat Window */}
      <Card className="flex-1 min-h-0 mb-4 border border-gray-200">
        <div className="h-full p-6">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <h3 className="text-xl font-medium mb-3">Research Session Started</h3>
                  <p className="text-base">Send your first message to begin the conversation with your selected persona.</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <ResearchMessage
                  key={index}
                  message={message}
                  persona={message.responding_persona_id ? getPersonaInfo(message.responding_persona_id) : undefined}
                />
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Generating response...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* User Input Box - Always visible */}
      <Card className="flex-shrink-0 p-4 border border-gray-200">
        <ResearchMessageInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder="Type your message and optionally attach reference documents..."
        />
      </Card>
    </div>
  );
};
