
import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResearchMessageInput } from './ResearchMessageInput';
import { ResearchMessage } from './ResearchMessage';
import { ResearchConversationProps } from './types';

export const ResearchConversation: React.FC<ResearchConversationProps> = ({
  messages,
  loadedPersonas,
  isLoading,
  onSendMessage,
  onSelectResponder
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getPersonaInfo = (personaId: string) => {
    return loadedPersonas.find(p => p.persona_id === personaId);
  };

  const showConversationArea = loadedPersonas.length > 0;

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Conversation Display Area - Fixed height */}
      {showConversationArea && (
        <div className="flex-shrink-0 mb-4">
          <Card className="border border-gray-200 h-[500px] flex flex-col">
            <div className="p-6 flex flex-col h-full">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <h3 className="text-xl font-medium mb-3">Research Session Active</h3>
                      <p className="text-base">Start your conversation by sending a message below.</p>
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
        </div>
      )}

      {/* Chat Input - Fixed height */}
      {showConversationArea && (
        <Card className="flex-shrink-0 p-4 border border-gray-200">
          <ResearchMessageInput
            onSendMessage={onSendMessage}
            disabled={isLoading}
            placeholder="Type your message and optionally attach reference documents..."
          />
        </Card>
      )}
    </div>
  );
};
