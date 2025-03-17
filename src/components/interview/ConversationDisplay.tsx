
import React from 'react';
import { cn } from '@/lib/utils';
import { AudioWave } from '@/components/ui/audio-wave';
import { Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  role: 'ai' | 'user';
  isComplete: boolean;
}

interface ConversationDisplayProps {
  messages: Message[];
  isSpeaking: boolean;
  isListening: boolean;
  className?: string;
}

export const ConversationDisplay = ({
  messages,
  isSpeaking,
  isListening,
  className,
}: ConversationDisplayProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={cn('flex flex-col space-y-4 overflow-y-auto p-4', className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start gap-3 rounded-lg p-3',
            message.role === 'ai' 
              ? 'bg-muted/50 text-foreground' 
              : 'bg-primary/10 ml-8'
          )}
        >
          {message.role === 'ai' && (
            <div className="rounded-full bg-primary/10 p-2 mt-1">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {message.role === 'ai' ? (
                <>
                  <span className="text-sm font-medium">AI Interviewer</span>
                  {isSpeaking && message.id === messages[messages.length - 1].id && (
                    <AudioWave isActive={true} type="speaking" className="ml-2" />
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm font-medium ml-auto">You</span>
                  {isListening && message.id === messages[messages.length - 1].id && (
                    <AudioWave 
                      isActive={true} 
                      type="listening" 
                      color="bg-blue-500" 
                      className="ml-2" 
                    />
                  )}
                </>
              )}
            </div>
            <p className={cn(
              "text-sm whitespace-pre-wrap",
              !message.isComplete && "animate-pulse"
            )}>
              {message.content}
            </p>
          </div>
          
          {message.role === 'user' && (
            <div className="rounded-full bg-blue-500/10 p-2 mt-1">
              <User className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
