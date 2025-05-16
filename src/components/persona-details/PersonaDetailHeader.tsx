
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatName } from "@/lib/utils";
import { Persona } from "@/services/persona";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaCloneForm from "./PersonaCloneForm";
import DeletePersonaDialog from "@/components/personas/DeletePersonaDialog";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  onDelete: () => void;
}

const PersonaDetailHeader = ({ 
  persona, 
  isOwner, 
  isPublic, 
  onVisibilityChange, 
  onDelete 
}: PersonaDetailHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-plasmik">{formatName(persona.name)}</h1>
        <p className="text-muted-foreground">ID: {persona.persona_id} • Created: {persona.creation_date}</p>
        
        <PersonaVisibilityToggle 
          personaId={persona.persona_id}
          isPublic={isPublic}
          isOwner={isOwner}
          onVisibilityChange={onVisibilityChange}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <PersonaCloneForm persona={persona} />
        
        {isOwner && (
          <DeletePersonaDialog 
            personaId={persona.persona_id}
            personaName={persona.name}
            userId={persona.user_id || ''}
            onDelete={onDelete}
          />
        )}
        
        <Button 
          asChild
          className="flex items-center gap-2"
        >
          <Link to={`/persona/${persona.persona_id}/chat`}>
            <MessageCircle className="w-4 h-4" />
            Chat with Persona
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PersonaDetailHeader;
