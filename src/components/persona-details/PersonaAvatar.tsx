
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="relative">
      <Avatar className="h-32 w-32 bg-primary/10 text-primary text-4xl font-bold">
        {persona.profile_image_url ? (
          <AvatarImage src={persona.profile_image_url} alt={persona.name} />
        ) : (
          <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
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
