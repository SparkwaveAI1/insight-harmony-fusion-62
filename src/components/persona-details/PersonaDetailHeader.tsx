
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
  
  // Extract a concise image ID from the URL
  const extractImageId = (url: string): string => {
    if (!url) return 'None';
    
    // Try to extract the img- part which is the actual image ID
    const imgMatch = url.match(/img-([a-zA-Z0-9]+)/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    
    // If no img- pattern found, use the last part of the URL path
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // If the last part contains query parameters, extract just the filename
    if (lastPart.includes('?')) {
      return lastPart.split('?')[0];
    }
    
    return lastPart || 'Unknown';
  };

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
          
          {/* Display public/private status */}
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3" /> Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" /> Private
              </>
            )}
          </p>
          
          {/* Add Image ID information in a more concise format */}
          <p className="text-xs text-muted-foreground mt-1">
            Image ID: {persona.profile_image_url ? extractImageId(persona.profile_image_url) : 'None'}
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
            isGenerating={isGeneratingImage}
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
