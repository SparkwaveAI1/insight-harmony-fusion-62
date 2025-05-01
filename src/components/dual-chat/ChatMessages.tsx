
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CornerDownRight } from 'lucide-react';
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isResponding: boolean;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  disableAutoScroll?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isResponding,
  getPersonaName,
  messagesEndRef,
  disableAutoScroll = true // Add this prop with default value true
}) => {
  return (
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
  );
};

export default ChatMessages;
