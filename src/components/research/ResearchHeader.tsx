
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Users } from 'lucide-react';
import { Persona } from '@/services/persona/types';

interface ResearchHeaderProps {
  loadedPersonas: Persona[];
  messages: any[];
  onSaveConversation?: () => void;
  onExportTranscript: () => void;
  hasProject?: boolean;
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({
  loadedPersonas,
  messages,
  onSaveConversation,
  onExportTranscript,
  hasProject = true
}) => {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Session info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{loadedPersonas.length} personas active</span>
          </div>
          {!hasProject && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              No Project (Export Only)
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        {hasMessages && (
          <div className="flex items-center gap-2">
            {hasProject && onSaveConversation && (
              <Button
                onClick={onSaveConversation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Conversation
              </Button>
            )}
            
            <Button
              onClick={onExportTranscript}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Transcript
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
