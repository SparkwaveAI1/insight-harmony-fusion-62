
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, ArrowRightLeft } from 'lucide-react';

interface ChatInputProps {
  userInput: string;
  setUserInput: (input: string) => void;
  targetPersona: 'personaA' | 'personaB';
  setTargetPersona: (persona: 'personaA' | 'personaB') => void;
  handleUserSendMessage: () => void;
  handleUserSendMessageToTarget?: (message: string, target: 'personaA' | 'personaB') => void;
  handleStartConversation: () => void;
  isResponding: boolean;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
  activePersonasLoaded: boolean;
  exchangeCount: number;
  maxExchanges: number;
  autoChatActive: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  targetPersona,
  setTargetPersona,
  handleUserSendMessage,
  handleUserSendMessageToTarget,
  handleStartConversation,
  isResponding,
  getPersonaName,
  activePersonasLoaded,
  exchangeCount,
  maxExchanges,
  autoChatActive
}) => {
  
  // Updated to handle direct sending to a specific persona
  const handleSendToPersona = (persona: 'personaA' | 'personaB') => {
    const message = userInput.trim();
    if (message) {
      if (handleUserSendMessageToTarget) {
        handleUserSendMessageToTarget(message, persona);
        setUserInput(''); // Clear the input field after sending
      }
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex flex-col gap-4">
        {/* Larger textarea with 3 lines */}
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.shiftKey === false && userInput.trim()) {
              e.preventDefault();
              handleUserSendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={isResponding || !activePersonasLoaded || autoChatActive}
          className="min-h-[120px] resize-none"
          rows={3}
        />
        
        {/* Buttons moved below the text area */}
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleSendToPersona('personaA')}
              disabled={!userInput.trim() || isResponding || !activePersonasLoaded || autoChatActive}
              className="whitespace-nowrap"
              title={`Send to ${getPersonaName('personaA')}`}
            >
              <Send className="h-4 w-4 mr-2" />
              To {getPersonaName('personaA')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSendToPersona('personaB')}
              disabled={!userInput.trim() || isResponding || !activePersonasLoaded || autoChatActive}
              className="whitespace-nowrap"
              title={`Send to ${getPersonaName('personaB')}`}
            >
              <Send className="h-4 w-4 mr-2" />
              To {getPersonaName('personaB')}
            </Button>
          </div>
          
          <Button
            variant="default"
            onClick={handleStartConversation}
            disabled={isResponding || !activePersonasLoaded || autoChatActive}
            className="whitespace-nowrap"
            title="Continue conversation between personas"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Continue Chat
          </Button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground text-center">
        {exchangeCount > 0 && (
          <span>Exchange count: {exchangeCount}/{maxExchanges}</span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
