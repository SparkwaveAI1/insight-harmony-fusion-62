
import React from "react";
import { Link } from "react-router-dom";
import { formatName } from "@/lib/utils";
import Card from "@/components/ui-custom/Card";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AddToCollectionButton from "./AddToCollectionButton";
import { Switch } from "@/components/ui/switch";
import { Persona } from "@/services/persona/types";
import { updatePersonaVisibility } from "@/services/persona/personaService";

interface PersonaCardProps {
  persona: Persona;
  onVisibilityChange?: (personaId: string, isPublic: boolean) => void;
}

export default function PersonaCard({ persona, onVisibilityChange }: PersonaCardProps) {
  const { user } = useAuth();
  const isOwner = user && persona.user_id === user.id;

  // Helper function to format date strings
  const formatDateString = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    try {
      await updatePersonaVisibility(persona.persona_id, checked);
      toast.success(`Persona is now ${checked ? 'public' : 'private'}`);
      if (onVisibilityChange) {
        onVisibilityChange(persona.persona_id, checked);
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update persona visibility");
    }
  };

  return (
    <Card className="relative group overflow-hidden">
      <Link to={`/persona-detail/${persona.persona_id}`} className="block p-6">
        <h3 className="text-xl font-semibold mb-1">{formatName(persona.name)}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          ID: {persona.persona_id} • Created: {formatDateString(persona.creation_date)}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-sm">{persona.metadata?.age || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gender</p>
            <p className="text-sm">{persona.metadata?.gender || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Occupation</p>
            <p className="text-sm">{persona.metadata?.occupation || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm">{persona.metadata?.region || "N/A"}</p>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <AddToCollectionButton personaId={persona.persona_id} />
        <Link
          to={`/persona-chat/${persona.persona_id}`}
          className="p-2 bg-background/90 rounded-full hover:bg-muted/90 transition-colors"
          title="Chat with persona"
        >
          <MessageCircle className="h-4 w-4" />
        </Link>
      </div>
      
      {/* Visibility toggle (only for the owner) */}
      {isOwner && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {persona.is_public ? "Public" : "Private"}
          </span>
          <Switch 
            checked={!!persona.is_public}
            onCheckedChange={handleVisibilityToggle}
            aria-label="Toggle persona visibility"
          />
        </div>
      )}
    </Card>
  );
}
