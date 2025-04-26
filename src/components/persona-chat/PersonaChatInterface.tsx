
import React, { useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import ErrorDisplay from '@/components/persona-chat/ErrorDisplay';
import { usePersonaChat } from '@/components/persona-chat/usePersonaChat';

interface PersonaChatInterfaceProps {
  personaId: string;
}

const PersonaChatInterface = ({ personaId }: PersonaChatInterfaceProps) => {
  const {
    messages,
    isResponding,
    isLoading,
    error,
    activePersona,
    handleSendMessage
  } = usePersonaChat(personaId);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !activePersona) {
    return <ErrorDisplay personaId={personaId} />;
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-[520px]">
        <MessageList 
          messages={messages} 
          isResponding={isResponding} 
        />
      </ScrollArea>
      
      <MessageInput
        onSendMessage={handleSendMessage}
        isResponding={isResponding}
      />
    </Card>
  );
};

export default PersonaChatInterface;
