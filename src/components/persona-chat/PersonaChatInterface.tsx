
import React, { useRef } from 'react';
import { MessageCircle, Volume } from 'lucide-react';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="space-y-4">
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
      
      <Alert className="bg-amber-50 border-amber-200">
        <Volume className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800 font-medium">
          Voice conversation feature is currently in development. Stay tuned for updates!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PersonaChatInterface;
