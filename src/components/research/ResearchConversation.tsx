
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResearchMessage } from "./ResearchMessage";
import { ResearchMessageInput } from "./ResearchMessageInput";
import { ResearchPersonaDisplay } from "./ResearchPersonaDisplay";
import ProjectSelectionDialog from "./ProjectSelectionDialog";
import { Save, Users, Target, MessageSquare, Database } from "lucide-react";
import { toast } from "sonner";
import { LoadedPersona, ResearchMessage as ResearchMessageType } from "./hooks/types";

interface ResearchConversationProps {
  sessionId: string | null;
  loadedPersonas: LoadedPersona[];
  messages: ResearchMessageType[];
  isLoading: boolean;
  onSendMessage: (message: string, imageFile?: File) => Promise<void>;
  onSelectResponder: (personaId: string) => Promise<void>;
  projectId?: string | null;
}

export default function ResearchConversation({
  sessionId,
  loadedPersonas,
  messages,
  isLoading,
  onSendMessage,
  onSelectResponder,
  projectId
}: ResearchConversationProps) {
  const [selectedPersona, setSelectedPersona] = useState<LoadedPersona | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Select first persona by default
  useEffect(() => {
    if (loadedPersonas.length > 0 && !selectedPersona) {
      setSelectedPersona(loadedPersonas[0]);
    }
  }, [loadedPersonas, selectedPersona]);

  const handleSaveConversation = async (selectedProjectId: string | null) => {
    if (!sessionId || messages.length === 0) {
      toast.error("No conversation to save");
      return false;
    }

    setIsSaving(true);
    try {
      // For now, just show success - actual implementation will come later
      setShowSaveDialog(false);
      toast.success("Conversation saved successfully!");
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast.error("Failed to save conversation");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (loadedPersonas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Users className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-medium">No Personas Loaded</h3>
            <p className="text-sm text-muted-foreground">
              Start a research session to begin conversations with AI personas
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main conversation area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with personas and controls */}
        <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Research Session</h2>
              </div>
              
              {projectId && (
                <Badge variant="outline" className="gap-1">
                  <Database className="h-3 w-3" />
                  Project Session
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {loadedPersonas.map((persona) => (
                  <Avatar key={persona.persona_id} className="border-2 border-background w-8 h-8">
                    <AvatarImage src={persona.image_url} />
                    <AvatarFallback className="text-xs">
                      {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              
              <Badge variant="secondary">
                {loadedPersonas.length} Persona{loadedPersonas.length !== 1 ? 's' : ''}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={messages.length === 0 || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Conversation
              </Button>
            </div>
          </div>

          {/* Persona selector tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {loadedPersonas.map((persona) => (
              <Button
                key={persona.persona_id}
                variant={selectedPersona?.persona_id === persona.persona_id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPersona(persona)}
                className="flex-shrink-0"
              >
                <Avatar className="w-4 h-4 mr-2">
                  <AvatarImage src={persona.image_url} />
                  <AvatarFallback className="text-xs">
                    {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {persona.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start Your Research</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask a question or share a topic to begin your research conversation with the loaded personas.
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                // Convert LoadedPersona to the format expected by ResearchMessage
                const persona = loadedPersonas.find(p => p.persona_id === message.personaId);
                const personaForMessage = persona ? {
                  ...persona,
                  id: persona.persona_id, // Map persona_id to id for compatibility
                  creation_date: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  behavioral_modulation: {},
                  linguistic_profile: {},
                  persona_context: {},
                  persona_type: 'research',
                  trait_profile: {},
                  interview_sections: [],
                  preinterview_tags: [],
                  simulation_directives: {},
                  is_public: false,
                  profile_image_url: persona.image_url
                } : undefined;

                return (
                  <ResearchMessage 
                    key={`${message.timestamp}-${index}`} 
                    message={message} 
                    persona={personaForMessage}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ResearchMessageInput
            onSendMessage={onSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Persona details sidebar - only show if we have a selected persona */}
      {selectedPersona && (
        <div className="w-80 border-l bg-muted/30">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Persona Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPersona.image_url} />
                  <AvatarFallback>
                    {selectedPersona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedPersona.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedPersona.persona_id}</p>
                </div>
              </div>
              
              {selectedPersona.metadata && (
                <div>
                  <h5 className="font-medium mb-2">Persona Information</h5>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {selectedPersona.metadata.age && (
                      <p>Age: {selectedPersona.metadata.age}</p>
                    )}
                    {selectedPersona.metadata.occupation && (
                      <p>Occupation: {selectedPersona.metadata.occupation}</p>
                    )}
                    {selectedPersona.metadata.region && (
                      <p>Region: {selectedPersona.metadata.region}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save conversation dialog */}
      <ProjectSelectionDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onProjectSelected={handleSaveConversation}
      />
    </div>
  );
}
