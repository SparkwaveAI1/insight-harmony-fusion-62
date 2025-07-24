
import React from 'react';
import { MessageSquare, Search, UserRound } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export type ChatMode = 'conversation';

interface ChatModeSelectorProps {
  selectedMode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({ selectedMode, onChange }) => {
  return (
    <div className="flex flex-col space-y-4 p-4 bg-muted/30 rounded-lg border border-muted mb-4">
      <h3 className="text-sm font-semibold">Conversation Mode</h3>
      <div className="grid grid-cols-1 gap-3">
        <div 
          className="flex items-center gap-3 p-3 rounded-md border border-primary bg-primary/10"
        >
          <div className="text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={true} 
                disabled={true}
                className="data-[state=checked]:bg-primary"
              />
              <span className="font-medium">Conversation</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Natural back-and-forth dialogue with authentic persona responses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModeSelector;
