
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Download, Trash2, Save } from 'lucide-react';
import { LoadedPersona, ResearchMessage } from './hooks/types';

interface ResearchSessionHeaderProps {
  loadedPersonas: LoadedPersona[];
  messages: ResearchMessage[];
  onSaveConversation: () => void;
  onExportTranscript: () => void;
  onClearSession: () => void;
  onManagePersonas: () => void;
}

export const ResearchSessionHeader: React.FC<ResearchSessionHeaderProps> = ({
  loadedPersonas,
  messages,
  onSaveConversation,
  onExportTranscript,
  onClearSession,
  onManagePersonas
}) => {
  return (
    <div className="flex items-center justify-between mb-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Research Session</span>
          <Badge variant="secondary">{loadedPersonas.length}/4 Personas</Badge>
          <Badge variant="outline" className="text-xs">
            {messages.length} messages
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveConversation}
          disabled={messages.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportTranscript}
          disabled={messages.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSession}
          disabled={messages.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onManagePersonas}
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage
        </Button>
      </div>
    </div>
  );
};
