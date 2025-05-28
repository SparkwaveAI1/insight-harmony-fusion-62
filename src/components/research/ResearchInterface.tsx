
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Settings, Download, Trash2, Send } from 'lucide-react';
import { PersonaLoader } from './PersonaLoader';
import { ResearchConversation } from './ResearchConversation';
import { SessionData } from './hooks/types';

interface ResearchInterfaceProps {
  sessionData: SessionData;
  onCreateSession: (selectedPersonas: string[]) => Promise<boolean>;
  onSendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  onSelectResponder: (personaId: string) => Promise<void>;
}

const ResearchInterface: React.FC<ResearchInterfaceProps> = ({
  sessionData,
  onCreateSession,
  onSendMessage,
  onSelectResponder
}) => {
  const { sessionId, loadedPersonas, messages, isLoading } = sessionData;
  const [showPersonaLoader, setShowPersonaLoader] = useState(!sessionId);

  const handleStartSession = async (selectedPersonas: string[]) => {
    console.log('Starting session with personas:', selectedPersonas);
    const success = await onCreateSession(selectedPersonas);
    if (success) {
      setShowPersonaLoader(false);
    }
  };

  const handleExportTranscript = () => {
    console.log('Export transcript functionality to be implemented');
  };

  const handleClearSession = () => {
    console.log('Clear session functionality to be implemented');
  };

  const handleSendToActivePersona = async () => {
    if (loadedPersonas.length > 0) {
      const activePersona = loadedPersonas[0];
      console.log('Sending chat to active persona:', activePersona.name);
      await onSelectResponder(activePersona.persona_id);
    }
  };

  // Show button when there's an active persona and messages exist
  const shouldShowSendButton = loadedPersonas.length > 0 && messages.length > 0;

  if (showPersonaLoader || !sessionId) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Research Session</h1>
            <p className="text-muted-foreground">
              Select a persona to participate in your research conversation
            </p>
          </div>
          <PersonaLoader
            maxPersonas={1}
            onStartSession={handleStartSession}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Research Session</span>
            <Badge variant="secondary">{loadedPersonas.length}/1 Persona</Badge>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTranscript}
            disabled={messages.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSession}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPersonaLoader(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {/* Loaded Personas Display */}
      <Card className="flex-shrink-0 mb-4 p-4 bg-muted/30">
        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Active Persona:</h4>
        <div className="flex flex-wrap gap-3">
          {loadedPersonas.map((persona) => (
            <div key={persona.persona_id} className="flex items-center gap-2 bg-background rounded-lg p-2 border">
              <Avatar className="h-6 w-6">
                <AvatarImage src={persona.image_url} />
                <AvatarFallback className="text-xs">
                  {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{persona.name}</span>
              {persona.metadata?.occupation && (
                <Badge variant="outline" className="text-xs">
                  {persona.metadata.occupation}
                </Badge>
              )}
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
            </div>
          ))}
        </div>
      </Card>

      {/* Send to Persona Button */}
      {shouldShowSendButton && (
        <Card className="flex-shrink-0 mb-4 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Send to Active Persona</h4>
              <p className="text-xs text-muted-foreground">
                Send the current conversation to {loadedPersonas[0]?.name} for their response
              </p>
            </div>
            <Button 
              onClick={handleSendToActivePersona}
              disabled={isLoading}
              className="ml-4"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send to Persona'}
            </Button>
          </div>
        </Card>
      )}

      {/* Research Conversation */}
      <div className="flex-1 min-h-0">
        <ResearchConversation
          messages={messages}
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onSelectResponder={onSelectResponder}
        />
      </div>
    </div>
  );
};

export default ResearchInterface;
