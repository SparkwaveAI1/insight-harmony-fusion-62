
import React from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui-custom/Button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  userInput: string;
  setUserInput: (input: string) => void;
  targetPersona: 'personaA' | 'personaB';
  setTargetPersona: (persona: 'personaA' | 'personaB') => void;
  handleUserSendMessage: () => void;
  isResponding: boolean;
  getPersonaName: (type: 'personaA' | 'personaB') => string;
  activePersonasLoaded: boolean;
  exchangeCount: number;
  maxExchanges: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  targetPersona,
  setTargetPersona,
  handleUserSendMessage,
  isResponding,
  getPersonaName,
  activePersonasLoaded,
  exchangeCount,
  maxExchanges
}) => {
  return (
    <div className="border-t p-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <select 
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={targetPersona}
            onChange={(e) => setTargetPersona(e.target.value as 'personaA' | 'personaB')}
            disabled={isResponding || !activePersonasLoaded}
          >
            <option value="personaA">Send to {getPersonaName('personaA')}</option>
            <option value="personaB">Send to {getPersonaName('personaB')}</option>
          </select>
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUserSendMessage()}
            placeholder="Type your message..."
            disabled={isResponding || !activePersonasLoaded}
            className="flex-1"
          />
        </div>
        <Button
          onClick={handleUserSendMessage}
          disabled={!userInput.trim() || isResponding || !activePersonasLoaded}
        >
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
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
