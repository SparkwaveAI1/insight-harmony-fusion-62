
import React from 'react';
import { MessageSquare, Search, UserRound } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export type ChatMode = 'conversation' | 'research' | 'roleplay';

interface ChatModeSelectorProps {
  selectedMode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({ selectedMode, onChange }) => {
  return (
    <div className="flex flex-col space-y-4 p-4 bg-muted/30 rounded-lg border border-muted mb-4">
      <h3 className="text-sm font-semibold">Conversation Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border ${
            selectedMode === 'conversation' ? 'border-primary bg-primary/10' : 'border-muted'
          }`}
          onClick={() => onChange('conversation')}
        >
          <div className={`${selectedMode === 'conversation' ? 'text-primary' : 'text-muted-foreground'}`}>
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedMode === 'conversation'} 
                onCheckedChange={() => onChange('conversation')}
                className="data-[state=checked]:bg-primary"
              />
              <span className="font-medium">Casual Conversation</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Natural back-and-forth dialogue with questions
            </p>
          </div>
        </div>
        
        <div 
          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border ${
            selectedMode === 'research' ? 'border-primary bg-primary/10' : 'border-muted'
          }`}
          onClick={() => onChange('research')}
        >
          <div className={`${selectedMode === 'research' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Search className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedMode === 'research'} 
                onCheckedChange={() => onChange('research')}
                className="data-[state=checked]:bg-primary"
              />
              <span className="font-medium">Research Mode</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Interview style with minimal questions
            </p>
          </div>
        </div>
        
        <div 
          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border ${
            selectedMode === 'roleplay' ? 'border-primary bg-primary/10' : 'border-muted'
          }`}
          onClick={() => onChange('roleplay')}
        >
          <div className={`${selectedMode === 'roleplay' ? 'text-primary' : 'text-muted-foreground'}`}>
            <UserRound className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedMode === 'roleplay'} 
                onCheckedChange={() => onChange('roleplay')}
                className="data-[state=checked]:bg-primary"
              />
              <span className="font-medium">Role-Play</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scenario-based with purpose-driven questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModeSelector;
