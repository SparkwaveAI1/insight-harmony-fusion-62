
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

  // Create custom insights for Alina R
  const isAlinaR = persona.persona_id === '9f8540fa' || 
                  (persona.name?.includes('Alina') && persona.metadata?.occupation === 'Financial Analyst');
  
  // Custom insights text for decision-making section
  let decisionText = "";
  if (isAlinaR) {
    decisionText = "Relies on data visualization tools for complex financial decisions. Balances risk and reward through multi-scenario modeling.";
  } else if (persona.trait_profile?.behavioral_economics?.risk_sensitivity && 
    parseFloat(persona.trait_profile.behavioral_economics.risk_sensitivity) > 0.6) {
    decisionText = "Prefers proven, tangible solutions over speculative ideas. Skeptical toward trends without track record.";
  } else {
    decisionText = "Embraces new opportunities, comfortable with risk-taking and innovation.";
  }
  
  // Custom insights text for drivers section
  let driversText = "";
  if (isAlinaR) {
    driversText = "Motivated by sustainable growth and ethical investing principles. Values work-life integration and financial security.";
  } else if (persona.trait_profile?.big_five?.openness && 
    parseFloat(persona.trait_profile.big_five.openness) > 0.6) {
    driversText = "Motivated by novelty, exploration and intellectual curiosity.";
  } else {
    driversText = "Seeks personal security and social loyalty. Respects those who \"earn their place\" through action.";
  }
  
  // Custom insights text for persuasion section
  let persuasionText = "";
  if (isAlinaR) {
    persuasionText = "Responds to evidence-based arguments with practical applications. Appreciates detailed analysis backed by real-world examples.";
  } else if (persona.trait_profile?.big_five?.agreeableness && 
    parseFloat(persona.trait_profile.big_five.agreeableness) > 0.6) {
    persuasionText = "Receptive to collaboration, values harmony in discussions.";
  } else {
    persuasionText = "Resists persuasion framed as emotional appeals. Responds better to strategic argumentation and earned trust.";
  }

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
        
        {/* Decisions section */}
        <div className="mt-3 bg-blue-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Brain className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Decisions</h4>
          </div>
          <p className="text-xs">
            {decisionText}
          </p>
        </div>
        
        {/* Drivers section */}
        <div className="mt-3 bg-green-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Drivers</h4>
          </div>
          <p className="text-xs">
            {driversText}
          </p>
        </div>
        
        {/* Persuasion section */}
        <div className="mt-3 bg-purple-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Discussion / Persuasion</h4>
          </div>
          <p className="text-xs">
            {persuasionText}
          </p>
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
