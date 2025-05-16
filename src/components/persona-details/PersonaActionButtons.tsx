
import { MessageCircle, Trash } from "lucide-react";
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
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="default" 
        onClick={onChatClick} 
        className="flex-1 flex items-center gap-2 min-w-[180px]"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with Persona
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleDeletePersona} 
        disabled={isDeleting}
        size="icon"
        className="text-muted-foreground hover:text-destructive hover:border-destructive"
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">{isDeleting ? "Deleting..." : "Delete"}</span>
      </Button>
    </div>
  );
}
