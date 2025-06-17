
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Download, Trash2, Send, Save } from 'lucide-react';
import { PersonaLoader } from './PersonaLoader';
import { ResearchConversation } from './ResearchConversation';
import { SessionData } from './hooks/types';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';

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
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleStartSession = async (selectedPersonas: string[]) => {
    console.log('Starting session with personas:', selectedPersonas);
    const success = await onCreateSession(selectedPersonas);
    if (success) {
      setShowPersonaLoader(false);
    }
  };

  const handleExportTranscript = () => {
    if (messages.length === 0) return;

    // Create markdown content
    let markdownContent = '# Research Session Transcript\n\n';
    
    // Add session metadata
    markdownContent += `**Session ID:** ${sessionId}\n`;
    markdownContent += `**Date:** ${new Date().toLocaleString()}\n`;
    markdownContent += `**Total Messages:** ${messages.length}\n\n`;
    
    // Add personas section
    markdownContent += '## Active Personas\n\n';
    loadedPersonas.forEach(persona => {
      markdownContent += `- **${persona.name}**`;
      if (persona.metadata?.occupation) {
        markdownContent += ` (${persona.metadata.occupation})`;
      }
      if (persona.metadata?.age) {
        markdownContent += ` - Age ${persona.metadata.age}`;
      }
      if (persona.metadata?.region) {
        markdownContent += ` - ${persona.metadata.region}`;
      }
      markdownContent += '\n';
    });
    
    markdownContent += '\n## Conversation\n\n';
    
    // Add messages
    messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      
      if (message.role === 'user') {
        markdownContent += `**[${timestamp}] User:** ${message.content}\n\n`;
      } else if (message.responding_persona_id) {
        const persona = loadedPersonas.find(p => p.persona_id === message.responding_persona_id);
        const personaName = persona?.name || 'Unknown Persona';
        markdownContent += `**[${timestamp}] ${personaName}:** ${message.content}\n\n`;
      }
    });
    
    // Create and download file
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research-session-${sessionId}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Research transcript exported successfully');
  };

  const handleClearSession = () => {
    console.log('Clear session functionality to be implemented');
    // For now, just reload the page or reset to persona loader
    setShowPersonaLoader(true);
  };

  const handleSendToPersona = async (personaId: string) => {
    const persona = loadedPersonas.find(p => p.persona_id === personaId);
    if (persona) {
      console.log('Sending chat to persona:', persona.name);
      await onSelectResponder(personaId);
    }
  };

  const handleSaveConversation = () => {
    setShowSaveModal(true);
  };

  const handleConversationSaved = (conversationId: string, projectId: string) => {
    console.log('Conversation saved successfully:', conversationId, 'to project:', projectId);
    setShowSaveModal(false);
    // User can continue the conversation after saving
  };

  // Convert research messages to the format expected by SaveConversationModal
  const formatMessagesForSave = () => {
    return messages.map(message => ({
      role: message.role as "user" | "assistant",
      content: message.content,
      persona_id: message.responding_persona_id
    }));
  };

  // Show buttons when there are active personas and messages exist
  const shouldShowSendButtons = loadedPersonas.length > 0 && messages.length > 0;

  if (showPersonaLoader || !sessionId) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Research Session</h1>
            <p className="text-muted-foreground">
              Select up to 4 personas to participate in your research conversation
            </p>
          </div>
          <PersonaLoader
            maxPersonas={4}
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
            onClick={handleSaveConversation}
            disabled={messages.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
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
        </div>
      </div>

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

      {/* Send to Persona Buttons */}
      {shouldShowSendButtons && (
        <Card className="flex-shrink-0 mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Send to Personas</h4>
            <p className="text-xs text-muted-foreground">
              Send the current conversation to any of your active personas for their response
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {loadedPersonas.map((persona) => (
                <Button 
                  key={persona.persona_id}
                  onClick={() => handleSendToPersona(persona.persona_id)}
                  disabled={isLoading}
                  variant="outline"
                  className="justify-start"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sending...' : `To ${persona.name}`}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Loaded Personas Display - moved to bottom */}
      <Card className="flex-shrink-0 mt-6 p-4 bg-muted/30">
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

      {/* Save Conversation Modal */}
      <SaveConversationModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        messages={formatMessagesForSave()}
        personaIds={loadedPersonas.map(p => p.persona_id)}
        defaultTitle={`Research Session - ${new Date().toLocaleDateString()}`}
        onSaved={handleConversationSaved}
      />
    </div>
  );
};

export default ResearchInterface;
