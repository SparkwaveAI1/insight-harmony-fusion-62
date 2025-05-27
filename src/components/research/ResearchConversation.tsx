
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResearchMessageInput } from './ResearchMessageInput';
import { ResearchMessage } from './ResearchMessage';
import { PersonaSelector } from './PersonaSelector';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';

interface ResearchConversationProps {
  messages: (Message & { responding_persona_id?: string })[];
  loadedPersonas: Persona[];
  autoMode: boolean;
  isLoading: boolean;
  onSendMessage: (message: string, imageFile?: File | null) => void;
  onSelectResponder: (personaId: string) => void;
}

export const ResearchConversation: React.FC<ResearchConversationProps> = ({
  messages,
  loadedPersonas,
  autoMode,
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
      {/* Messages */}
      <Card className="flex-1 min-h-0 mb-4">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Research Session Started</h3>
                <p>Send your first message to begin the conversation with your selected personas.</p>
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Generating response...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Persona Selection - Always visible when not in auto mode */}
      {!autoMode && (
        <Card className="mb-4 p-4">
          <h4 className="font-medium mb-3">Select persona to respond:</h4>
          <PersonaSelector
            personas={loadedPersonas}
            onSelect={onSelectResponder}
          />
        </Card>
      )}

      {/* Input */}
      <ResearchMessageInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        placeholder="Type your message to continue the research conversation..."
      />
    </div>
  );
};
