
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui-custom/Button";
import Card from "@/components/ui-custom/Card";

const PersonaEmptyState = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-bold mb-3">No Personas Found</h3>
      <p className="text-muted-foreground mb-6">
        You haven't generated any personas yet. Create your first persona to see it here.
      </p>
      <Button onClick={() => navigate('/simulated-persona')}>
        Create a Persona
      </Button>
    </Card>
  );
};

export default PersonaEmptyState;
