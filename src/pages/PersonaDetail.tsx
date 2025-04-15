
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { toast } from "sonner";
import { getPersonaByPersonaId } from "@/services/persona/personaService";
import { Persona } from "@/services/persona/types";
import PersonaHeader from "@/components/persona-details/PersonaHeader";
import PersonaLoadingState from "@/components/persona-details/PersonaLoadingState";
import PersonaDemographics from "@/components/persona-details/PersonaDemographics";
import PersonaTraits from "@/components/persona-details/PersonaTraits";
import InterviewResponses from "@/components/persona-details/InterviewResponses";

const PersonaDetail = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId]);

  const loadPersona = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getPersonaByPersonaId(id);
      if (data) {
        console.log("Persona data loaded:", data);
        setPersona(data);
      } else {
        toast.error("Persona not found");
      }
    } catch (error) {
      console.error("Error loading persona:", error);
      toast.error("Failed to load persona details");
    } finally {
      setIsLoading(false);
    }
  };

  const getInterviewSections = () => {
    if (!persona?.interview_sections) return [];
    
    if (Array.isArray(persona.interview_sections)) {
      return persona.interview_sections;
    }
    
    if ('interview_sections' in persona.interview_sections) {
      return persona.interview_sections.interview_sections || [];
    }
    
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <PersonaHeader />
            
            {isLoading ? (
              <PersonaLoadingState />
            ) : !persona ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-bold mb-3">Persona Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The persona you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Button as={Link} to="/persona-viewer">View All Personas</Button>
              </Card>
            ) : (
              <div className="space-y-8 max-w-4xl mx-auto">
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 font-plasmik">{persona.name}</h1>
                      <p className="text-muted-foreground">ID: {persona.persona_id} • Created: {persona.creation_date}</p>
                    </div>
                    {persona.prompt && (
                      <div className="bg-muted/50 p-3 rounded-md max-w-md">
                        <p className="text-sm font-medium mb-1">Original Prompt</p>
                        <p className="text-sm italic">"{persona.prompt}"</p>
                      </div>
                    )}
                  </div>
                  
                  <PersonaDemographics metadata={persona.metadata} />
                  <PersonaTraits traitProfile={persona.trait_profile} />
                </Card>
                
                <InterviewResponses sections={getInterviewSections()} />
              </div>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaDetail;
