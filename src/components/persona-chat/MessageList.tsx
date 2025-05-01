
import React, { useRef, useEffect } from 'react';
import { Message } from '@/components/persona-chat/types';

interface MessageListProps {
  messages: Message[];
  isResponding: boolean;
  disableAutoScroll?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isResponding, disableAutoScroll }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto scroll if disableAutoScroll is not true
    if (!disableAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, disableAutoScroll]);

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-4'
                : 'bg-muted mr-4'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      {isResponding && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-lg bg-muted mr-4">
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
  );
};

export default MessageList;
