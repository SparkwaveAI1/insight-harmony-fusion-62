
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import PersonaAvatar from "./PersonaAvatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaDescriptionEditor from "./PersonaDescriptionEditor";
import PersonaImageGenerationDialog from "./PersonaImageGenerationDialog";
import { Persona } from "@/services/persona/types";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (description: string) => Promise<void>;
  onImageGenerated: () => Promise<string | null>;
}

export default function PersonaDetailHeader({
  persona,
  isOwner,
  isPublic,
  onVisibilityChange,
  onDelete,
  onNameUpdate,
  onDescriptionUpdate,
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
        <div className="flex-1 space-y-6">
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

          {/* Key persona information in a structured layout */}
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

          {/* Description section */}
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

          {/* Owner controls - removed Delete button from here */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 pt-4">
              <PersonaVisibilityToggle
                personaId={persona.persona_id}
                isPublic={isPublic}
                isOwner={isOwner}
                onVisibilityChange={onVisibilityChange}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
