import React, { useState } from 'react';
import { PersonaLoader } from './PersonaLoader';
import ResearchConversation from './ResearchConversation';
import { ResearchSessionHeader } from './ResearchSessionHeader';
import { ResearchPersonaDisplay } from './ResearchPersonaDisplay';
import { ResearchSendToPersonas } from './ResearchSendToPersonas';
import { SessionData } from './hooks/types';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';
import ProjectSelectionDialog from './ProjectSelectionDialog';

interface ResearchInterfaceProps {
  sessionData: SessionData;
  onCreateSession: (selectedPersonas: string[], projectId?: string | null) => Promise<boolean>;
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
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [pendingPersonas, setPendingPersonas] = useState<string[]>([]);

  const handleStartSession = async (selectedPersonas: string[]) => {
    console.log('Starting session with personas:', selectedPersonas);
    
    // Show project selection dialog first
    setPendingPersonas(selectedPersonas);
    setShowProjectDialog(true);
  };

  const handleProjectSelected = async (projectId: string | null) => {
    setCurrentProjectId(projectId);
    
    // Now create the session with the selected project
    const success = await onCreateSession(pendingPersonas, projectId);
    if (success) {
      setShowPersonaLoader(false);
      setPendingPersonas([]);
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
      } else if (message.personaId) {
        const persona = loadedPersonas.find(p => p.persona_id === message.personaId);
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
      persona_id: message.personaId
    }));
  };

  // Show buttons when there are active personas and messages exist
  const shouldShowSendButtons = loadedPersonas.length > 0 && messages.length > 0;

  if (showPersonaLoader || !sessionId) {
    return (
      <>
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

        <ProjectSelectionDialog
          open={showProjectDialog}
          onOpenChange={setShowProjectDialog}
          onProjectSelected={handleProjectSelected}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Session Header */}
      <ResearchSessionHeader
        loadedPersonas={loadedPersonas}
        messages={messages}
        onSaveConversation={handleSaveConversation}
        onExportTranscript={() => {}} // Keep existing function
        onClearSession={() => setShowPersonaLoader(true)}
        onManagePersonas={() => setShowPersonaLoader(true)}
      />

      {/* Research Conversation */}
      <div className="flex-1 min-h-0">
        <ResearchConversation
          sessionId={sessionId}
          messages={messages}
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onSelectResponder={onSelectResponder}
          projectId={currentProjectId}
        />
      </div>

      {/* Send to Persona Buttons */}
      {shouldShowSendButtons && (
        <ResearchSendToPersonas
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendToPersona={async (personaId: string) => {
            const persona = loadedPersonas.find(p => p.persona_id === personaId);
            if (persona) {
              console.log('Sending chat to persona:', persona.name);
              await onSelectResponder(personaId);
            }
          }}
        />
      )}

      {/* Loaded Personas Display */}
      <ResearchPersonaDisplay loadedPersonas={loadedPersonas} />

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
