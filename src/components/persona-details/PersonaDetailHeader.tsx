
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Globe, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Persona } from "@/services/persona/types";
import { deletePersona } from "@/services/persona";
import PersonaVisibilityToggle from "./PersonaVisibilityToggle";
import PersonaAvatar from "./PersonaAvatar";
import PersonaNameEditor from "./PersonaNameEditor";
import PersonaActionButtons from "./PersonaActionButtons";
import GenerateImageButton from "./GenerateImageButton";
import PersonaCloneForm from "./PersonaCloneForm";

interface PersonaDetailHeaderProps {
  persona: Persona;
  isOwner: boolean;
  isPublic: boolean;
  onVisibilityChange: (newVisibility: boolean) => void;
  onDelete: () => void;
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const navigate = useNavigate();
  
  const handleDeletePersona = async () => {
    try {
      const success = await deletePersona(persona.persona_id);
      if (success) {
        toast.success("Persona deleted successfully");
        onPersonaDeleted?.();
        navigate("/persona-viewer");
      } else {
        toast.error("Failed to delete persona");
      }
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
      if (!imageUrl) {
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
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  const hasProfileImage = !!persona.profile_image_url;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-4">
        <PersonaAvatar 
          persona={persona}
          isOwner={isOwner}
          isGeneratingImage={isGeneratingImage}
          onGenerateImage={handleGenerateImage}
        />
        
        <div>
          <PersonaNameEditor 
            personaId={persona.persona_id}
            initialName={persona.name}
            onNameUpdate={onNameUpdated}
          />
          
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {persona.is_public ? (
              <>
                <Globe className="h-3 w-3" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Private
              </>
            )}
          </p>
          
          <PersonaVisibilityToggle 
            personaId={persona.persona_id} 
            isPublic={isPublic} 
            isOwner={isOwner} 
            onVisibilityChange={onVisibilityChange} 
          />
          
          <GenerateImageButton
            isVisible={isOwner}
            isGenerating={isGeneratingImage}
            onGenerate={handleGenerateImage}
            hasImage={hasProfileImage}
          />
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full md:w-auto">
        <PersonaCloneForm persona={persona} />
        
        <PersonaActionButtons
          personaId={persona.persona_id}
          onDelete={handleDeletePersona}
          onChatClick={handleChatClick}
        />
      </div>
    </div>
  );
}
