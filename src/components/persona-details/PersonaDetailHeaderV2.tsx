import React, { useState } from "react";
import { Download, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import PersonaAvatar from "./PersonaAvatar";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaDescriptionEditor from "./PersonaDescriptionEditor";
import PersonaImageGenerationDialog from "./PersonaImageGenerationDialog";
import { DbPersonaV2 } from "@/services/persona/types/persona-v2-db";

interface PersonaDetailHeaderV2Props {
  persona: DbPersonaV2;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (description: string) => Promise<void>;
  onImageGenerated: () => Promise<string | null>;
  onDownloadJSON: () => void;
  onChatClick: () => void;
  onPersonaUpdated?: (updatedPersona: DbPersonaV2) => void;
}

export default function PersonaDetailHeaderV2({
  persona,
  isOwner,
  isPublic,
  onVisibilityChange,
  onDelete,
  onNameUpdate,
  onDescriptionUpdate,
  onImageGenerated,
  onDownloadJSON,
  onChatClick,
  onPersonaUpdated
}: PersonaDetailHeaderV2Props) {
  return (
    <Card className="p-8 mb-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - Avatar and Controls */}
        <div className="flex flex-col items-center space-y-4 flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            {persona.profile_image_url ? (
              <img 
                src={persona.profile_image_url} 
                alt={persona.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {persona.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
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
                <Badge variant="outline">V2 Research-Grade Persona</Badge>
                {isPublic && <Badge variant="secondary">Public</Badge>}
                {!isPublic && isOwner && <Badge variant="outline">Private</Badge>}
              </div>
            </div>

            {/* Prominent Chat Button */}
            <Button 
              onClick={onChatClick} 
              size="lg"
              className="flex-shrink-0"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat with {persona.name}
            </Button>
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
              <p className="text-base">{persona.persona_data?.identity?.age || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Location</h3>
              <p className="text-base">
                {persona.persona_data?.identity?.location 
                  ? `${persona.persona_data.identity.location.city}, ${persona.persona_data.identity.location.region}`
                  : 'Not specified'
                }
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Occupation</h3>
              <p className="text-base">{persona.persona_data?.identity?.occupation || 'Not specified'}</p>
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
              </div>
              <Button variant="outline" onClick={onDownloadJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}