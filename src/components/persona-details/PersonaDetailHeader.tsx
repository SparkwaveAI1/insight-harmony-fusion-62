
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Persona } from "@/services/persona/types";
import { deletePersona } from "@/services/persona";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaActionButtons from "./PersonaActionButtons";
import PersonaCloneForm from "./PersonaCloneForm";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (newVisibility: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => void;
  onImageGenerated: () => Promise<string | null>;
}

export default function PersonaDetailHeader({ 
  persona, 
  isOwner, 
  isPublic,
  onVisibilityChange,
  onDelete: onPersonaDeleted,
  onNameUpdate: onNameUpdated,
  onImageGenerated
}: PersonaDetailHeaderProps) {
  const navigate = useNavigate();
  
  const handleDeletePersona = async () => {
    try {
      await deletePersona(persona.persona_id);
      toast.success("Persona deleted successfully");
      await onPersonaDeleted?.();
      navigate("/persona-viewer");
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("An error occurred while deleting the persona");
    }
  };
  
  const handleChatClick = () => {
    navigate(`/persona/${persona.persona_id}/chat`);
  };

  if (!persona) {
    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
      <div>
        <PersonaNameEditor 
          personaId={persona.persona_id}
          initialName={persona.name}
          onNameUpdate={onNameUpdated}
        />
        
        {/* Display Persona ID */}
        <p className="text-xs text-muted-foreground mt-1">
          Persona ID: {persona.persona_id}
        </p>
        
        <PersonaVisibilityToggle 
          personaId={persona.persona_id} 
          isPublic={isPublic} 
          isOwner={isOwner} 
          onVisibilityChange={onVisibilityChange} 
        />
      </div>
      
      <div className="flex flex-col gap-3 w-full md:w-[240px]">
        <PersonaCloneForm persona={persona} />
        <PersonaActionButtons
          personaId={persona.persona_id}
          onChatClick={handleChatClick}
        />
      </div>
    </div>
  );
}
