
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import PersonaAvatar from "./PersonaAvatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaImageGenerationDialog from "./PersonaImageGenerationDialog";
import DeletePersonaButton from "./DeletePersonaButton";
import { Persona } from "@/services/persona/types";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => Promise<void>;
  onImageGenerated: () => Promise<string | null>;
}

export default function PersonaDetailHeader({
  persona,
  isOwner,
  isPublic,
  onVisibilityChange,
  onDelete,
  onNameUpdate,
  onImageGenerated
}: PersonaDetailHeaderProps) {
  return (
    <Card className="p-8 mb-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Avatar and Image Generation */}
        <div className="flex flex-col items-center space-y-4">
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

        {/* Persona Details */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            {isOwner ? (
              <PersonaNameEditor
                personaId={persona.persona_id}
                initialName={persona.name}
                onNameUpdate={onNameUpdate}
              />
            ) : (
              <h1 className="text-3xl font-bold">{persona.name}</h1>
            )}
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">Research-Grade Persona</Badge>
              {isPublic && <Badge variant="secondary">Public</Badge>}
              {!isPublic && isOwner && <Badge variant="outline">Private</Badge>}
            </div>
          </div>

          {/* Key persona information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {persona.metadata?.age && (
              <div>
                <span className="font-medium">Age:</span> {persona.metadata.age}
              </div>
            )}
            {persona.metadata?.location && (
              <div>
                <span className="font-medium">Location:</span> {persona.metadata.location}
              </div>
            )}
            {persona.metadata?.occupation && (
              <div>
                <span className="font-medium">Occupation:</span> {persona.metadata.occupation}
              </div>
            )}
            {persona.metadata?.education && (
              <div>
                <span className="font-medium">Education:</span> {persona.metadata.education}
              </div>
            )}
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 pt-4">
              <PersonaVisibilityToggle
                personaId={persona.persona_id}
                isPublic={isPublic}
                isOwner={isOwner}
                onVisibilityChange={onVisibilityChange}
              />
              
              <DeletePersonaButton
                onDelete={onDelete}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
