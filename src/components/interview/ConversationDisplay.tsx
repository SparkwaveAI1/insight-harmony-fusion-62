
import React from 'react';
import { cn } from '@/lib/utils';
import { AudioWave } from '@/components/ui/audio-wave';
import { Bot, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
            'flex items-start gap-3 rounded-lg p-3 animate-fade-in',
            message.role === 'ai' 
              ? 'bg-[#2a2a2a] text-[#f5f5f5] border border-[#3b82f6]/20' 
              : 'bg-[#3b82f6]/10 ml-8 text-[#f5f5f5]'
          )}
          style={{
            boxShadow: message.role === 'ai' ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none'
          }}
        >
          {message.role === 'ai' && (
            <Avatar className="rounded-full h-10 w-10 border border-[#3b82f6]/30 overflow-hidden">
              <AvatarImage src="/lovable-uploads/c58004f6-798b-47c0-be8b-701e182b6c62.png" alt="AI Interviewer" />
              <AvatarFallback className="bg-[#3b82f6]/10">
                <Bot className="h-4 w-4 text-[#3b82f6]" />
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {message.role === 'ai' ? (
                <>
                  <span className="text-sm font-medium text-[#f5f5f5]">AI Interviewer</span>
                  {isSpeaking && message.id === messages[messages.length - 1].id && (
                    <AudioWave isActive={true} type="speaking" className="ml-2" color="bg-[#3b82f6]" />
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm font-medium ml-auto text-[#f5f5f5]">You</span>
                  {isListening && message.id === messages[messages.length - 1].id && (
                    <AudioWave 
                      isActive={true} 
                      type="listening" 
                      color="bg-[#3b82f6]" 
                      className="ml-2" 
                    />
                  )}
                </>
              )}
            </div>
            <p className={cn(
              "text-sm text-[#f5f5f5] whitespace-pre-wrap",
              !message.isComplete && "animate-pulse"
            )}>
              {message.content}
            </p>
          </div>
          
          {message.role === 'user' && (
            <Avatar className="rounded-full h-10 w-10 border border-[#3b82f6]/30">
              <AvatarFallback className="bg-[#3b82f6]/10">
                <User className="h-4 w-4 text-[#3b82f6]" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
