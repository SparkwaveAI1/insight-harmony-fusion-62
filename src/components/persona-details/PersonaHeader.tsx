
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
    <div className="flex items-center justify-between mb-8">
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
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold"
        >
          <MessageCircle className="mr-3 h-6 w-6" />
          {isChatOpen ? 'Hide Chat' : chatButtonText}
        </Button>
      )}
    </div>
  );
};

export default PersonaHeader;
