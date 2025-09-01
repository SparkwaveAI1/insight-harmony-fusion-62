
import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import PersonaAvatar from "./PersonaAvatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaDescriptionEditor from "./PersonaDescriptionEditor";
import PersonaImageGenerationDialog from "./PersonaImageGenerationDialog";
import PersonaEnhancementDialog from "./PersonaEnhancementDialog";
import { Persona } from "@/services/persona/types";
import { validatePersonaCompleteness } from "@/services/persona/validation/personaValidation";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (description: string) => Promise<void>;
  onImageGenerated: () => Promise<string | null>;
  onPersonaUpdated?: (updatedPersona: Persona) => void;
}

export default function PersonaDetailHeader({
  persona,
  isOwner,
  isPublic,
  onVisibilityChange,
  onDelete,
  onNameUpdate,
  onDescriptionUpdate,
  onImageGenerated,
  onPersonaUpdated
}: PersonaDetailHeaderProps) {
  const [showEnhancementDialog, setShowEnhancementDialog] = useState(false);
  
  // Validate persona to determine what needs enhancement
  const validationResult = validatePersonaCompleteness(persona);
  const needsEnhancement = !validationResult.isValid || 
    !validationResult.completeness.hasEmotionalTriggers ||
    !validationResult.completeness.hasInterviewResponses ||
    !validationResult.completeness.hasMetadata;
  return (
    <Card className="p-8 mb-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Avatar and Controls */}
        <div className="flex flex-col items-center space-y-4 flex-shrink-0">
          <PersonaAvatar 
            persona={persona}
            isOwner={isOwner}
            isGeneratingImage={false}
            onGenerateImage={() => {}}
          />
          
          {isOwner && (
            <PersonaImageGenerationDialog
              persona={persona}
              onImageGenerated={onImageGenerated}
            />
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header Section with Name and Chat Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              {isOwner ? (
                <PersonaNameEditor
                  personaId={persona.persona_id}
                  initialName={persona.name}
                  onNameUpdate={onNameUpdate}
                />
              ) : (
                <h1 className="text-3xl font-bold mb-3">{persona.name}</h1>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">Research-Grade Persona</Badge>
                {isPublic && <Badge variant="secondary">Public</Badge>}
                {!isPublic && isOwner && <Badge variant="outline">Private</Badge>}
              </div>
            </div>

          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
            {isOwner ? (
              <PersonaDescriptionEditor
                personaId={persona.persona_id}
                initialDescription={persona.description || ''}
                onDescriptionUpdate={onDescriptionUpdate}
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                {persona.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Key persona information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Age</h3>
              <p className="text-base">{persona.metadata?.age || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
              <p className="text-base">{persona.metadata?.location || persona.metadata?.region || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Occupation</h3>
              <p className="text-base">{persona.metadata?.occupation || 'Not specified'}</p>
            </div>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <PersonaVisibilityToggle
                  personaId={persona.persona_id}
                  isPublic={isPublic}
                  isOwner={isOwner}
                  onVisibilityChange={onVisibilityChange}
                />
                {needsEnhancement && (
                  <Button 
                    variant="default" 
                    onClick={() => setShowEnhancementDialog(true)}
                    className="bg-gradient-to-r from-primary to-primary-foreground"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Update Persona
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhancement Dialog */}
      {isOwner && onPersonaUpdated && (
        <PersonaEnhancementDialog
          open={showEnhancementDialog}
          onOpenChange={setShowEnhancementDialog}
          persona={persona}
          validationResult={validationResult}
          onPersonaUpdated={onPersonaUpdated}
        />
      )}
    </Card>
  );
}
