
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Persona } from "@/services/persona/personaService";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard = ({ persona }: PersonaCardProps) => {
  const navigate = useNavigate();

  return (
    <Card key={persona.persona_id} className="p-6 flex flex-col h-full">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{persona.name}</h3>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            ID: {persona.persona_id}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Created: {persona.creation_date}</p>
      </div>
      
      <div className="mb-4 flex-grow">
        <h4 className="text-sm font-semibold mb-1">Demographics</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Age: {persona.metadata.age}</li>
          <li>Gender: {persona.metadata.gender}</li>
          <li>Occupation: {persona.metadata.occupation}</li>
          <li>Location: {persona.metadata.region}</li>
        </ul>
        
        {persona.prompt && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-1">Original Prompt</h4>
            <p className="text-sm text-muted-foreground italic">"{persona.prompt}"</p>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate(`/persona/${persona.persona_id}`)}
        >
          View Details
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default PersonaCard;
