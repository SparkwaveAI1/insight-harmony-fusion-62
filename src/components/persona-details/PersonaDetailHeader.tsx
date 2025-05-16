
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onNameUpdate: (name: string) => Promise<void>;
}

const PersonaDetailHeader = ({ 
  persona, 
  isOwner, 
  isPublic, 
  onVisibilityChange, 
  onDelete,
  onNameUpdate
}: PersonaDetailHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(persona.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = () => {
    setName(persona.name);
    setIsEditing(true);
  };

  const handleNameSave = async () => {
    if (!name.trim() || name === persona.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onNameUpdate(name);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating persona name:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setName(persona.name);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
      <div className="space-y-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-xl font-bold max-w-md"
            />
            <Button 
              size="sm" 
              onClick={handleNameSave} 
              disabled={isUpdating || !name.trim() || name === persona.name}
              className="ml-2"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : 'Save'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-plasmik">{formatName(persona.name)}</h1>
            {isOwner && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEditClick}
                className="p-1 h-auto"
              >
                <Pencil className="w-4 h-4" />
                <span className="sr-only">Edit Name</span>
              </Button>
            )}
          </div>
        )}
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
