
import React, { useRef, useEffect } from 'react';
import { Message } from '@/components/persona-chat/types';

interface MessageListProps {
  messages: Message[];
  isResponding: boolean;
  disableAutoScroll?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isResponding, 
  disableAutoScroll,
  messagesEndRef 
}) => {
  const defaultMessagesEndRef = useRef<HTMLDivElement>(null);
  const actualEndRef = messagesEndRef || defaultMessagesEndRef;

  useEffect(() => {
    // Only auto scroll if disableAutoScroll is not true
    if (!disableAutoScroll && actualEndRef.current) {
      actualEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, disableAutoScroll, actualEndRef]);

  // Function to add style variations based on message position and content
  const getMessageStyle = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    if (isUser) return "bg-primary text-primary-foreground ml-4";
    
    // Check if message contains emotion indicators
    const hasEmphasis = /!/.test(message.content);
    const hasQuestion = /\?/.test(message.content);
    const isShort = message.content.length < 30;
    const hasQuote = /"([^"]*)"/.test(message.content);
    
    // Create variations based on content and position
    const variations = [
      "bg-muted mr-4", // Default
      "bg-muted/90 mr-4", // Subtle variation
      "bg-muted/95 mr-4", // Another subtle variation
      hasEmphasis ? "bg-muted/80 mr-4 border-l-2 border-primary/30" : "bg-muted/90 mr-4", // Emphasis
      hasQuestion ? "bg-muted/90 mr-4 border-b border-muted-foreground/20" : "bg-muted mr-4", // Question
      isShort ? "bg-muted/80 mr-4 rounded-xl" : "bg-muted mr-4", // Short response
      hasQuote ? "bg-muted/95 mr-4 border-l-2 border-muted-foreground/30" : "bg-muted mr-4" // Contains quote
    ];
    
    // Choose variation based on message content and position
    const variationIndex = hasEmphasis ? 3 : 
                         hasQuestion ? 4 : 
                         isShort ? 5 : 
                         hasQuote ? 6 : 
                         index % 3; // Default rotation of subtle variations
                         
    return variations[variationIndex];
  };

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
              getMessageStyle(message, index)
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <div ref={actualEndRef} />
    </div>
  );
};

export default MessageList;
