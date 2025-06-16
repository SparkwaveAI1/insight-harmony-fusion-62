
import React, { useRef } from 'react';
import Card from '@/components/ui-custom/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageList from '@/components/persona-chat/MessageList';
import MessageInput from '@/components/persona-chat/MessageInput';
import { Message } from '@/components/persona-chat/types';

interface ChatAreaProps {
  messages: Message[];
  isResponding: boolean;
  onSendMessage: (message: string, file?: File | null) => void;
  personaImageUrl?: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isResponding,
  onSendMessage,
  personaImageUrl
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="h-[600px] flex flex-col">
      <ScrollArea className="flex-1 h-[520px]">
        <MessageList 
          messages={messages} 
          isResponding={isResponding} 
          messagesEndRef={messagesEndRef}
          disableAutoScroll={true}
          personaImageUrl={personaImageUrl}
        />
      </ScrollArea>
      
      <MessageInput
        onSendMessage={onSendMessage}
        isResponding={isResponding}
      />
    </Card>
  );
};

export default ChatArea;
