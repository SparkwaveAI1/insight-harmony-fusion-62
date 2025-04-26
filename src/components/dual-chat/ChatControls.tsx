
import React from 'react';
import Button from '@/components/ui-custom/Button';

interface ChatControlsProps {
  handleStartConversation: () => void;
  handleStopConversation: () => void;
  autoChatActive: boolean;
  isResponding: boolean;
  activePersonasLoaded: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  handleStartConversation,
  handleStopConversation,
  autoChatActive,
  isResponding,
  activePersonasLoaded,
}) => {
  return (
    <div className="space-x-2">
      <Button 
        variant="outline"
        onClick={handleStartConversation} 
        disabled={!activePersonasLoaded || autoChatActive || isResponding}
      >
        Start Conversation
      </Button>
      <Button 
        variant="outline"
        onClick={handleStopConversation} 
        disabled={!autoChatActive}
      >
        Stop Conversation
      </Button>
    </div>
  );
};

export default ChatControls;
