
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui-custom/Button";
import { useNavigate } from "react-router-dom";

const PersonaHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate('/persona-viewer')}
      className="gap-2 mb-6"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to All Personas
    </Button>
  );
};

export default PersonaHeader;
