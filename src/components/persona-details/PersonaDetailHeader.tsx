
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
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

  const handleGenerateImage = async () => {
    if (isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    try {
      const imageUrl = await onImageGenerated();
      if (imageUrl) {
        toast.success("Profile image generated successfully");
      } else {
        toast.error("Failed to generate profile image");
      }
    } catch (error) {
      console.error("Error generating profile image:", error);
      toast.error("An error occurred while generating the profile image");
    } finally {
      setIsGeneratingImage(false);
    }
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

  // Extract initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Avatar className="w-20 h-20 border shadow-sm">
            {persona.profile_image_url ? (
              <AvatarImage src={persona.profile_image_url} alt={persona.name} />
            ) : (
              <AvatarFallback>{getInitials(persona.name)}</AvatarFallback>
            )}
          </Avatar>
          
          {isOwner && (
            <button 
              className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full shadow-sm hover:bg-primary/90 transition-colors"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              title="Generate profile image"
            >
              {isGeneratingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        
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
