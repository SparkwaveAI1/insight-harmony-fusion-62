
import React, { useEffect, RefObject } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  isResponding: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  disableAutoScroll?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isResponding, 
  messagesEndRef,
  disableAutoScroll = false
}) => {
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!disableAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, disableAutoScroll, messagesEndRef]);

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <div 
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <div className="flex items-start gap-2">
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-primary/20 hidden sm:flex">
                  <span className="text-xs font-semibold">AI</span>
                </Avatar>
              )}
              
              <div className="space-y-2">
                {message.image && (
                  <div className="mb-2">
                    <img 
                      src={message.image} 
                      alt="Shared image" 
                      className="max-w-full rounded-md max-h-[300px] object-contain"
                    />
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.timestamp && (
                  <div className="text-xs opacity-50 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-primary hidden sm:flex">
                  <span className="text-xs font-semibold text-white">You</span>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {isResponding && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg p-3 max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '600ms'}}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
