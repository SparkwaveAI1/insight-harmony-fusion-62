
import { Card } from "@/components/ui/card";

interface PersonaSummaryProps {
  personas: any[];
}

const PersonaSummary = ({ personas }: PersonaSummaryProps) => {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Persona Summary</h2>
        <span className="text-lg font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
          Total: {personas.length}
        </span>
      </div>
      
      <div className="space-y-2">
        {personas.map((persona, index) => (
          <div 
            key={persona.persona_id} 
            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{index + 1}. {persona.name}</span>
                <p className="text-sm text-muted-foreground mt-1">
                  ID: {persona.persona_id} • Created: {persona.creation_date}
                </p>
              </div>
              {persona.prompt && (
                <div className="text-sm italic text-muted-foreground max-w-[50%] text-right">
                  "{persona.prompt}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PersonaSummary;
