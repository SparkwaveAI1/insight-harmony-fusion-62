
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaLoader } from './PersonaLoader';
import { ResearchConversation } from './ResearchConversation';
import { ResearchHeader } from './ResearchHeader';
import { SendToPersonaSection } from './SendToPersonaSection';
import { ActivePersonasDisplay } from './ActivePersonasDisplay';
import { SessionData } from './hooks/types';
import { exportTranscript } from './utils/exportUtils';
import SaveConversationModal from '@/components/persona-chat/SaveConversationModal';

interface ResearchInterfaceProps {
  sessionData: SessionData;
  onCreateSession: (selectedPersonas: string[]) => Promise<boolean>;
  onSendMessage: (message: string, imageFile?: File | null) => Promise<void>;
  onSendToPersona: (personaId: string) => Promise<void>;
}

const ResearchInterface: React.FC<ResearchInterfaceProps> = ({
  sessionData,
  onCreateSession,
  onSendMessage,
  onSendToPersona
}) => {
  const { sessionId, loadedPersonas, messages, isLoading } = sessionData;
  const [showPersonaLoader, setShowPersonaLoader] = useState(!sessionId);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Check if this is a project-connected session
  const hasProject = searchParams.get('project') !== null;

  const handleStartSession = async (selectedPersonas: string[]) => {
    console.log('Starting session with personas:', selectedPersonas);
    const success = await onCreateSession(selectedPersonas);
    if (success) {
      setShowPersonaLoader(false);
    }
  };

  const handleExportTranscript = () => {
    exportTranscript(messages, loadedPersonas, sessionId);
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

  // Show send to persona buttons when there are active personas and messages exist
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
            {!hasProject && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>No Project Connected:</strong> This session can be exported but not saved. 
                  To save conversations, start a research session with a project.
                </p>
              </div>
            )}
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
      <ResearchHeader
        loadedPersonas={loadedPersonas}
        messages={messages}
        onSaveConversation={hasProject ? handleSaveConversation : undefined}
        onExportTranscript={handleExportTranscript}
        hasProject={hasProject}
      />

      {/* Research Conversation */}
      <div className="flex-1 min-h-0">
        <ResearchConversation
          messages={messages}
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* Send to Persona Buttons */}
      {shouldShowSendButtons && (
        <SendToPersonaSection
          loadedPersonas={loadedPersonas}
          isLoading={isLoading}
          onSendToPersona={onSendToPersona}
        />
      )}

      {/* Loaded Personas Display */}
      <ActivePersonasDisplay loadedPersonas={loadedPersonas} />

      {/* Save Conversation Modal - Only show if has project */}
      {hasProject && (
        <SaveConversationModal
          open={showSaveModal}
          onOpenChange={setShowSaveModal}
          messages={formatMessagesForSave()}
          personaIds={loadedPersonas.map(p => p.persona_id)}
          defaultTitle={`Research Session - ${new Date().toLocaleDateString()}`}
          onSaved={handleConversationSaved}
        />
      )}
    </div>
  );
};

export default ResearchInterface;
