
import { MessageCircle, Share2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PersonaActionButtonsProps {
  personaId: string;
  onDelete: () => void;
  onChatClick: () => void;
}

export default function PersonaActionButtons({
  personaId,
  onDelete,
  onChatClick
}: PersonaActionButtonsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeletePersona = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };
  
  const copyPersonaLink = () => {
    const url = `${window.location.origin}/persona/${personaId}`;
    navigator.clipboard.writeText(url);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onChatClick} className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Chat with Persona
      </Button>
      
      <Button variant="outline" onClick={copyPersonaLink} className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      <Button 
        variant="destructive" 
        onClick={handleDeletePersona} 
        disabled={isDeleting}
        className="flex items-center gap-2"
      >
        <Trash className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
