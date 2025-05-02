
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

  // Helper function to determine decision-making style
  const getDecisionStyle = () => {
    const riskAversion = persona.trait_profile?.behavioral_economics?.risk_aversion;
    if (riskAversion !== undefined) {
      return parseFloat(riskAversion as string) > 0.5 
        ? "Prefers thorough evaluation before committing" 
        : "Makes quick decisions based on intuition";
    }
    return "Balances analytical and intuitive decision approaches";
  };

  // Helper function to determine drivers
  const getDrivers = () => {
    const openness = persona.trait_profile?.big_five?.openness;
    const conscientiousness = persona.trait_profile?.big_five?.conscientiousness;
    
    if (openness !== undefined && conscientiousness !== undefined) {
      const opennessVal = parseFloat(openness as string);
      const conscientiousnessVal = parseFloat(conscientiousness as string);
      
      if (opennessVal > 0.6) 
        return "Seeks novel experiences and creative solutions";
      else if (conscientiousnessVal > 0.6)
        return "Prioritizes organization and achievement";
      else
        return "Values security and familiar environments";
    }
    return "Motivated by practical outcomes and reliable results";
  };

  // Helper function to determine persuasion style
  const getPersuasionStyle = () => {
    const agreeableness = persona.trait_profile?.big_five?.agreeableness;
    
    if (agreeableness !== undefined) {
      return parseFloat(agreeableness as string) > 0.5 
        ? "Receptive to collaborative discussion approaches" 
        : "Responds to fact-based, direct communication";
    }
    return "Balances emotional and logical persuasion approaches";
  };

  return (
    <Card className="relative group overflow-hidden">
      <Link to={`/persona-detail/${persona.persona_id}`} className="block p-6">
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
        
        {/* New sections */}
        <div className="space-y-3 mb-2">
          {/* Decisions */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Brain className="h-3 w-3 text-primary" />
              <p className="text-xs font-medium">Decisions</p>
            </div>
            <p className="text-xs text-muted-foreground">{getDecisionStyle()}</p>
          </div>
          
          {/* Drivers */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-3 w-3 text-primary" />
              <p className="text-xs font-medium">Drivers</p>
            </div>
            <p className="text-xs text-muted-foreground">{getDrivers()}</p>
          </div>
          
          {/* Discussion & Persuasion */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Users className="h-3 w-3 text-primary" />
              <p className="text-xs font-medium">Discussion & Persuasion</p>
            </div>
            <p className="text-xs text-muted-foreground">{getPersuasionStyle()}</p>
          </div>
        </div>
      </Link>

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
        <Link
          to={`/persona/${persona.persona_id}/chat`}
          className="p-2 bg-background/90 rounded-full hover:bg-muted/90 transition-colors"
          title="Chat with persona"
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling to parent
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
