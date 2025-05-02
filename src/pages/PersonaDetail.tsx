
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
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

  // Helper function to generate a personality snapshot
  const getPersonalitySnapshot = (persona: Persona) => {
    if (!persona?.trait_profile) return "";
    
    const traits = persona.trait_profile;
    const bigFive = traits.big_five;
    const economics = traits.behavioral_economics;
    
    if (!bigFive && !economics) return "";
    
    // Build a descriptive snapshot based on dominant traits
    let descriptors = [];
    
    if (bigFive?.openness && parseFloat(bigFive.openness) > 0.7) {
      descriptors.push("innovative");
    } else if (bigFive?.openness && parseFloat(bigFive.openness) < 0.3) {
      descriptors.push("traditional");
    }
    
    if (bigFive?.conscientiousness && parseFloat(bigFive.conscientiousness) > 0.7) {
      descriptors.push("methodical");
    } 
    
    if (bigFive?.extraversion && parseFloat(bigFive.extraversion) > 0.7) {
      descriptors.push("outgoing");
    } else if (bigFive?.extraversion && parseFloat(bigFive.extraversion) < 0.3) {
      descriptors.push("reserved");
    }
    
    if (economics?.risk_sensitivity && parseFloat(economics.risk_sensitivity) > 0.6) {
      descriptors.push("cautious decision-maker");
    } else if (economics?.risk_sensitivity && parseFloat(economics.risk_sensitivity) < 0.4) {
      descriptors.push("opportunity-seeking");
    }
    
    if (bigFive?.agreeableness && parseFloat(bigFive.agreeableness) > 0.7) {
      descriptors.push("collaborative");
    } else if (bigFive?.agreeableness && parseFloat(bigFive.agreeableness) < 0.3) {
      descriptors.push("direct");
    }
    
    // Default snapshot if we couldn't extract meaningful traits
    if (descriptors.length < 2) {
      return "Complex individual with nuanced decision-making patterns and specific motivational drivers";
    }
    
    // Format the descriptors into a sentence
    const formattedDescriptors = descriptors.slice(0, 3).join(", ");
    return `${formattedDescriptors.charAt(0).toUpperCase() + formattedDescriptors.slice(1)} individual focused on security and practical outcomes.`;
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
                      <p className="text-lg text-gray-700 font-medium border-l-4 pl-3 border-primary/30">
                        {getPersonalitySnapshot(persona)}
                      </p>
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
                    <div className="bg-muted/50 p-3 rounded-md max-w-md mt-6">
                      <p className="text-sm font-medium mb-1">Original Prompt</p>
                      <p className="text-sm italic">"{persona.prompt}"</p>
                    </div>
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
