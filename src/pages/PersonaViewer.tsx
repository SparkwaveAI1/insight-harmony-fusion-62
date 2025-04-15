
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getAllPersonas, Persona } from "@/services/persona/personaService";

const PersonaViewer = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPersonas();
      setPersonas(data);
    } catch (error) {
      console.error("Error loading personas:", error);
      toast.error("Failed to load personas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                variant="outline" 
                onClick={loadPersonas}
                className="gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik">Your Generated Personas</h1>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Progress value={75} className="w-64 mx-auto mb-4" />
                <p className="text-muted-foreground">Loading personas...</p>
              </div>
            ) : personas.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-bold mb-3">No Personas Found</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't generated any personas yet. Create your first persona to see it here.
                </p>
                <Button onClick={() => navigate('/simulated-persona')}>
                  Create a Persona
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personas.map((persona) => (
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
                ))}
              </div>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaViewer;
