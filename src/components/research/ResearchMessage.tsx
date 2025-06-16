import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot } from 'lucide-react';
import { ResearchMessageProps } from './types';

export const ResearchMessage: React.FC<ResearchMessageProps> = ({
  message,
  persona
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* Message Content */}
        <Card className={`p-3 ${isUser ? 'bg-primary text-primary-foreground' : ''}`}>
          {/* Header with persona info */}
          {!isUser && persona && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {persona.name}
              </Badge>
              {persona.metadata?.occupation && (
                <span className="text-xs text-muted-foreground">
                  {persona.metadata.occupation}
                </span>
              )}
            </div>
          )}
          
          {/* Message text */}
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Image if present */}
          {message.image && (
            <div className="mt-2">
              <img 
                src={message.image} 
                alt="Uploaded image" 
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {message.timestamp?.toLocaleTimeString() || new Date().toLocaleTimeString()}
          </div>
        </Card>
      </div>
    </div>
  );
};
