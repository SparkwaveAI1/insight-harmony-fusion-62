
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Download, Save } from 'lucide-react';
import { Persona } from '@/services/persona/types';
import { ResearchMessage } from './hooks/types';

interface ResearchHeaderProps {
  loadedPersonas: Persona[];
  messages: ResearchMessage[];
  onSaveConversation: () => void;
  onExportTranscript: () => void;
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({
  loadedPersonas,
  messages,
  onSaveConversation,
  onExportTranscript
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
      </div>
    </div>
  );
};
