
import React from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui-custom/Button';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isResponding: boolean;
}

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage, isResponding }: ChatInputProps) => {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isResponding}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isResponding}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
