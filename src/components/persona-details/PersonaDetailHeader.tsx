
import React from "react";
import { Persona } from "@/services/persona/types";
import PersonaAvatar from "./PersonaAvatar";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaCloneForm from "./PersonaCloneForm";
import GenerateImageButton from "./GenerateImageButton";

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
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex flex-col items-center space-y-4">
        <PersonaAvatar 
          persona={persona}
          size="xl"
        />
        {isOwner && (
          <GenerateImageButton 
            persona={persona}
            onImageGenerated={onImageGenerated}
          />
        )}
      </div>
      
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <PersonaNameEditor
            persona={persona}
            isOwner={isOwner}
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
              isPublic={isPublic}
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
