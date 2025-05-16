
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
    <div className="relative">
      <Avatar className="h-32 w-32 bg-primary/10 text-primary text-4xl font-bold">
        {hasValidImage ? (
          <AvatarImage 
            src={imageUrl} 
            alt={persona.name} 
            onError={handleImageError}
            className="object-cover"
          />
        ) : (
          <AvatarFallback>{persona.name.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      
      {isGeneratingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
          <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
