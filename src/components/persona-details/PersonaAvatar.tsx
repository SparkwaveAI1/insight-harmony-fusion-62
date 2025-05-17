
import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Persona } from "@/services/persona/types";

interface PersonaAvatarProps {
  persona: Persona;
  isOwner: boolean;
  isGeneratingImage: boolean;
  onGenerateImage: () => void;
  isImageMigrating?: boolean;
}

export default function PersonaAvatar({ 
  persona, 
  isOwner, 
  isGeneratingImage,
  isImageMigrating = false,
  onGenerateImage 
}: PersonaAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(persona.profile_image_url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  
  // Reset image error state and update URL when persona changes or image URL changes
  useEffect(() => {
    if (persona.profile_image_url) {
      // Only update if the URL has actually changed (to prevent unnecessary reloads)
      if (persona.profile_image_url !== imageUrl) {
        console.log("PersonaAvatar: Updating image URL:", persona.profile_image_url);
        setImageError(false);
        setImageLoaded(false);
        setImageUrl(persona.profile_image_url);
        setImageAttempts(0);
      }
    } else {
      // No image URL available, show fallback
      setImageError(true);
      setImageUrl(undefined);
      setImageLoaded(false);
    }
  }, [persona.persona_id, persona.profile_image_url, imageUrl]);
  
  const handleImageError = () => {
    console.error("Failed to load persona image:", imageUrl);
    
    // Increment attempts and try once more with a cache-busting URL (only once)
    if (imageAttempts === 0 && imageUrl) {
      console.log("Attempting to reload image with cache busting");
      setImageAttempts(prev => prev + 1);
      
      // Add cache-busting parameter
      const cacheBuster = `?t=${Date.now()}`;
      setImageUrl(`${imageUrl}${cacheBuster}`);
      return;
    }
    
    // After retry fails, give up and show fallback
    setImageError(true);
    setImageUrl(undefined);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageUrl);
    setImageLoaded(true);
    setImageError(false);
  };
  
  const hasValidImage = imageUrl && !imageError;
  const isProcessing = isGeneratingImage || isImageMigrating;
  
  return (
    <div className="relative cursor-pointer group" onClick={isOwner && !isProcessing ? onGenerateImage : undefined}>
      <Avatar className="h-32 w-32 bg-primary/10 text-primary text-4xl font-bold">
        {hasValidImage ? (
          <AvatarImage 
            src={imageUrl} 
            alt={persona.name} 
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={`object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          />
        ) : (
          <AvatarFallback>{persona.name.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
          <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {isOwner && !isProcessing && (
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
