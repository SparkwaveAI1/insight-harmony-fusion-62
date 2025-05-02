
import React from "react";
import { Link } from "react-router-dom";
import { formatName } from "@/lib/utils";
import Card from "@/components/ui-custom/Card";
import { Brain, MessageCircle, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AddToCollectionButton from "./AddToCollectionButton";
import { Switch } from "@/components/ui/switch";
import { Persona } from "@/services/persona/types";
import { updatePersonaVisibility } from "@/services/persona/personaService";
import DeletePersonaDialog from "./DeletePersonaDialog";

interface PersonaCardProps {
  persona: Persona;
  onVisibilityChange?: (personaId: string, isPublic: boolean) => void;
  onDelete?: (personaId: string) => void;
}

export default function PersonaCard({ 
  persona, 
  onVisibilityChange,
  onDelete 
}: PersonaCardProps) {
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(persona.persona_id);
    }
  };

  return (
    <Card className="relative group overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-1">{formatName(persona.name)}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          ID: {persona.persona_id} • Created: {formatDateString(persona.creation_date)}
        </p>
        
        {/* Basic Demographics */}
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
        
        {/* Additional info: psychographic traits - restored from previous version */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3 text-primary" />
            <p className="text-xs">
              {persona.trait_profile?.behavioral_economics?.risk_sensitivity 
                ? (parseFloat(persona.trait_profile.behavioral_economics.risk_sensitivity) > 0.5 
                  ? "Risk-averse" 
                  : "Risk-taker")
                : "Unknown risk profile"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-primary" />
            <p className="text-xs">
              {persona.trait_profile?.big_five?.openness 
                ? (parseFloat(persona.trait_profile.big_five.openness) > 0.5 
                  ? "Open-minded" 
                  : "Traditional")
                : "Unknown openness"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <p className="text-xs">
              {persona.trait_profile?.big_five?.extraversion 
                ? (parseFloat(persona.trait_profile.big_five.extraversion) > 0.5 
                  ? "Extroverted" 
                  : "Introverted")
                : "Unknown socialness"}
            </p>
          </div>
        </div>
        
        {/* Chat now button */}
        <Link 
          to={`/persona/${persona.persona_id}/chat`}
          className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm py-1 px-3 rounded flex items-center justify-center gap-1"
        >
          <MessageCircle className="h-3 w-3" />
          <span>Chat with persona</span>
        </Link>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {isOwner && (
          <DeletePersonaDialog 
            personaId={persona.persona_id}
            personaName={persona.name}
            onDelete={handleDelete}
          />
        )}
        <AddToCollectionButton personaId={persona.persona_id} />
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
