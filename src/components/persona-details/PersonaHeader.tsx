
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PersonaHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate('/persona-viewer')}
      className="gap-2 mb-6 flex items-center"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to All Personas
    </Button>
  );
};

export default PersonaHeader;
