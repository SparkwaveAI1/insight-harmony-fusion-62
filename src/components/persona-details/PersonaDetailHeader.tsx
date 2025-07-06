
import React from "react";
import { Persona } from "@/services/persona/types";
import PersonaAvatar from "./PersonaAvatar";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaCloneForm from "./PersonaCloneForm";
import { usePersonaImageGeneration } from "@/hooks/usePersonaImageGeneration";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => void;
  onImageGenerated: () => Promise<string | null>;
}

const PersonaDetailHeader = ({ 
  persona, 
  isOwner, 
  isPublic, 
  onVisibilityChange, 
  onNameUpdate,
  onImageGenerated 
}: PersonaDetailHeaderProps) => {
  const { generateImage, isGenerating } = usePersonaImageGeneration(persona);

  const handleImageGeneration = async () => {
    const imageUrl = await generateImage(false);
    if (imageUrl) {
      await onImageGenerated();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex flex-col items-center space-y-4">
        <PersonaAvatar 
          persona={persona}
          isOwner={isOwner}
          isGeneratingImage={isGenerating}
          onGenerateImage={handleImageGeneration}
        />
      </div>
      
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <PersonaNameEditor
            personaId={persona.persona_id}
            initialName={persona.name}
            onNameUpdate={onNameUpdate}
          />
          
          <div className="text-sm text-muted-foreground">
            <p>Created: {new Date(persona.creation_date).toLocaleDateString()}</p>
            <p>ID: <span className="font-mono text-xs">{persona.persona_id}</span></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {isOwner && (
            <PersonaVisibilityToggle
              personaId={persona.persona_id}
              isPublic={isPublic}
              isOwner={isOwner}
              onVisibilityChange={onVisibilityChange}
            />
          )}
          
          <PersonaCloneForm persona={persona} />
        </div>
      </div>
    </div>
  );
};

export default PersonaDetailHeader;
