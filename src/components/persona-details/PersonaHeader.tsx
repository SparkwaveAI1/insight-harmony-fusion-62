
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PersonaHeaderProps {
  showChatButton?: boolean;
  chatButtonText?: string;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
}

const PersonaHeader = ({ 
  showChatButton = false, 
  chatButtonText = "Chat", 
  onChatToggle,
  isChatOpen = false 
}: PersonaHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/persona-viewer')}
        className="gap-2 flex items-center"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Personas
      </Button>
      
      {showChatButton && onChatToggle && (
        <Button 
          onClick={onChatToggle}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          {isChatOpen ? 'Hide Chat' : chatButtonText}
        </Button>
      )}
    </div>
  );
};

export default PersonaHeader;
