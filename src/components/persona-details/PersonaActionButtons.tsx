
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonaActionButtonsProps {
  personaId: string;
  onChatClick: () => void;
}

export default function PersonaActionButtons({
  personaId,
  onChatClick
}: PersonaActionButtonsProps) {
  return (
    <div className="w-full">
      <Button 
        variant="default" 
        onClick={onChatClick} 
        className="w-full flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Chat with Persona
      </Button>
    </div>
  );
}
