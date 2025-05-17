
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
  isImageMigrating?: boolean;
  onVisibilityChange: (newVisibility: boolean) => void;
  onDelete: () => Promise<void>;
  onNameUpdate: (name: string) => void;
  onImageGenerated: () => Promise<string | null>;
}

export default function PersonaDetailHeader({ 
  persona, 
  isOwner, 
  isPublic,
  isImageMigrating = false,
  onVisibilityChange,
  onDelete: onPersonaDeleted,
  onNameUpdate: onNameUpdated,
  onImageGenerated
}: PersonaDetailHeaderProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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
      
      // Add a short timeout to refresh the page after image generation
      setTimeout(() => {
        // Force refresh by changing the URL slightly and then back
        const currentUrl = window.location.href;
        navigate(currentUrl + '?refresh=true');
        setTimeout(() => navigate(currentUrl), 100);
      }, 500);
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
          isImageMigrating={isImageMigrating}
          onGenerateImage={handleGenerateImage}
        />
        
        <div>
          <PersonaNameEditor 
            personaId={persona.persona_id}
            initialName={persona.name}
            onNameUpdate={onNameUpdated}
          />
          
          {/* Display Persona ID instead of Image ID */}
          <p className="text-xs text-muted-foreground mt-1">
            Persona ID: {persona.persona_id}
          </p>
          
          <PersonaVisibilityToggle 
            personaId={persona.persona_id} 
            isPublic={isPublic} 
            isOwner={isOwner} 
            onVisibilityChange={onVisibilityChange} 
          />
          
          {/* Always show the generate/regenerate image button for owners */}
          <GenerateImageButton
            isVisible={isOwner}
            isGenerating={isGeneratingImage || isImageMigrating}
            onGenerate={handleGenerateImage}
            hasImage={hasProfileImage}
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
