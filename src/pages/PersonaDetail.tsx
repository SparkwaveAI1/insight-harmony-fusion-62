
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, ChevronDown } from "lucide-react";
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
import { formatName } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const PersonaDetail = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);

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
    
    // Get the raw sections data
    let rawSections = [];
    
    if (Array.isArray(persona.interview_sections)) {
      rawSections = persona.interview_sections;
    } else if ('interview_sections' in persona.interview_sections) {
      rawSections = persona.interview_sections.interview_sections || [];
    }
    
    // Map the raw sections to the format expected by the InterviewResponses component
    return rawSections.map(section => {
      // Create a responses array from questions and responses
      const responses = [];
      
      // Try to extract responses from the section
      if (section.questions && Array.isArray(section.questions)) {
        section.questions.forEach((q, idx) => {
          // Handle different question formats
          if (typeof q === 'string' && section.responses && section.responses[idx]) {
            responses.push({
              question: q,
              answer: section.responses[idx]
            });
          } else if (typeof q === 'object' && q.question) {
            responses.push({
              question: q.question,
              answer: q.response || 'No response recorded'
            });
          }
        });
      }
      
      return {
        section_title: section.section || 'Interview Section',
        responses: responses
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-[#F5F5F7] via-background to-background pt-24">
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
                <Card className="p-6 shadow-md bg-white border-gray-100">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold font-plasmik">{formatName(persona.name)}</h1>
                      <p className="text-muted-foreground">ID: {persona.persona_id} • Created: {persona.creation_date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        as={Link} 
                        to={`/persona/${persona.persona_id}/chat`}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat with Persona
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-[#F5F5F7] p-6 rounded-lg mb-6">
                    <PersonaDemographics metadata={persona.metadata} />
                  </div>
                  
                  <div className="bg-[#F8F9FA] p-6 rounded-lg">
                    <PersonaTraits traitProfile={persona.trait_profile} />
                  </div>
                  
                  {persona.prompt && (
                    <Card className="p-6 shadow-md bg-white border-gray-100 max-w-none">
                      <Collapsible
                        open={promptOpen}
                        onOpenChange={setPromptOpen}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                            Original Prompt
                          </h2>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-slate-100">
                              <ChevronDown className={`h-4 w-4 transition-transform ${promptOpen ? "transform rotate-180" : ""}`} />
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        <CollapsibleContent className="mt-2">
                          <div className="bg-muted/50 p-4 rounded-md">
                            <p className="text-sm italic">"{persona.prompt}"</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  )}
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
