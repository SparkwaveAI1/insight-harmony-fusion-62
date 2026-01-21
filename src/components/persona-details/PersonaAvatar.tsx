
import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Persona } from "@/services/persona/types";

interface PersonaAvatarProps {
  persona: Persona;
  isOwner: boolean;
  isGeneratingImage: boolean;
  onGenerateImage: () => void;
}

export default function PersonaAvatar({ 
  persona, 
  isOwner, 
  isGeneratingImage, 
  onGenerateImage 
}: PersonaAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(persona.profile_image_url);
  
  // Reset image error state and update URL when persona changes
  useEffect(() => {
    if (persona.profile_image_url) {
      console.log("PersonaAvatar: Updating image URL:", persona.profile_image_url);
      setImageError(false);
      setImageUrl(persona.profile_image_url);
    }
  }, [persona.persona_id, persona.profile_image_url]);
  
  const handleImageError = () => {
    console.error("Failed to load persona image:", imageUrl);
    setImageError(true);
  };
  
  const hasValidImage = imageUrl && !imageError;
  
  return (
    <div className="relative cursor-pointer group" onClick={isOwner ? onGenerateImage : undefined}>
      <Avatar className="h-48 w-48 bg-primary/10 text-primary text-6xl font-bold rounded-lg">
        {hasValidImage ? (
          <AvatarImage 
            src={imageUrl} 
            alt={persona.name} 
            onError={handleImageError}
            className="object-cover object-top rounded-lg"
          />
        ) : (
          <AvatarFallback className="rounded-lg">{persona.name.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      
      {isGeneratingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {isOwner && !isGeneratingImage && (
        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="text-white flex flex-col items-center">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs mt-1">
              {hasValidImage ? "Regenerate Image" : "Generate Image"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
