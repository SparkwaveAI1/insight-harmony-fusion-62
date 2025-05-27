
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Settings, Download, Trash2 } from 'lucide-react';
import { PersonaLoader } from './PersonaLoader';
import { ResearchConversation } from './ResearchConversation';
import { useResearchSession } from './hooks/useResearchSession';

const ResearchInterface = () => {
  const {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    createSession,
    addPersonaToSession,
    removePersonaFromSession,
    sendMessage,
    selectPersonaResponder
  } = useResearchSession();

  const [showPersonaLoader, setShowPersonaLoader] = useState(!sessionId);

  const handleStartSession = async (selectedPersonas: string[]) => {
    const success = await createSession(selectedPersonas);
    if (success) {
      setShowPersonaLoader(false);
    }
  };

  const handleExportTranscript = () => {
    // Future: Export conversation transcript
    console.log('Export transcript functionality to be implemented');
  };

  const handleClearSession = () => {
    // Future: Clear current session
    console.log('Clear session functionality to be implemented');
  };

  if (showPersonaLoader || !sessionId) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Research Session</h1>
            <p className="text-muted-foreground">
              Select up to 6 personas to participate in your research conversation
            </p>
          </div>
          <PersonaLoader
            maxPersonas={6}
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
            <Badge variant="secondary">{loadedPersonas.length}/6 Personas</Badge>
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

      {/* Loaded Personas - Enhanced Display */}
      <Card className="flex-shrink-0 mb-4 p-4 bg-muted/30">
        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Active Personas:</h4>
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

      {/* Research Conversation - Main Interface */}
      <div className="flex-1 min-h-0">
        <ResearchConversation
          messages={messages}
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onSelectResponder={selectPersonaResponder}
        />
      </div>
    </div>
  );
};

export default ResearchInterface;
