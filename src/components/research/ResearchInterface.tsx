
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Settings, Play, Pause } from 'lucide-react';
import { PersonaLoader } from './PersonaLoader';
import { ResearchConversation } from './ResearchConversation';
import { useResearchSession } from './hooks/useResearchSession';

const ResearchInterface = () => {
  const {
    sessionId,
    loadedPersonas,
    messages,
    isLoading,
    autoMode,
    setAutoMode,
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Research Session</span>
            <Badge variant="secondary">{loadedPersonas.length}/6 Personas</Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoMode(!autoMode)}
            className="flex items-center gap-2"
          >
            {autoMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {autoMode ? 'Auto Mode' : 'Manual Mode'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPersonaLoader(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Personas
          </Button>
        </div>
      </div>

      {/* Loaded Personas */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/30 rounded-lg flex-shrink-0">
        {loadedPersonas.map((persona) => (
          <div key={persona.persona_id} className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {persona.name}
            </Badge>
          </div>
        ))}
      </div>

      {/* Research Conversation - Main content area */}
      <div className="flex-1 min-h-0">
        <ResearchConversation
          messages={messages}
          loadedPersonas={loadedPersonas}
          autoMode={autoMode}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onSelectResponder={selectPersonaResponder}
        />
      </div>
    </div>
  );
};

export default ResearchInterface;
