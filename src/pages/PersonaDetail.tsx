
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import Card from "@/components/ui-custom/Card";
import Button from "@/components/ui-custom/Button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getPersonaByPersonaId, Persona } from "@/services/persona/personaService";

// Define interfaces for the interview section structures
interface InterviewQuestion {
  question: string;
  response?: string;
}

interface InterviewSection {
  section: string;
  notes: string;
  questions: Array<string | InterviewQuestion>;
  responses?: string[];
}

// Interface for nested interview sections object structure
interface InterviewSectionsWrapper {
  interview_sections: InterviewSection[];
}

// Helper types for interview_sections property which could be either structure
type InterviewSections = InterviewSection[] | InterviewSectionsWrapper;

const PersonaDetail = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

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
        console.log("Interview sections structure:", data.interview_sections);
        setPersona(data);
        // Set the first section to be expanded by default
        const sections = getInterviewSectionsArray(data.interview_sections);
        if (sections.length > 0) {
          setExpandedSections({ [sections[0].section]: true });
        }
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper function to determine if the interview_sections is a wrapped object
  const isInterviewSectionsWrapper = (
    sections: InterviewSections | undefined
  ): sections is InterviewSectionsWrapper => {
    return (
      sections !== undefined &&
      !Array.isArray(sections) &&
      typeof sections === "object" &&
      "interview_sections" in sections
    );
  };
  
  // Helper function to get the interview sections as an array regardless of structure
  const getInterviewSectionsArray = (sections: InterviewSections | undefined): InterviewSection[] => {
    if (!sections) return [];
    
    if (Array.isArray(sections)) {
      return sections;
    }
    
    if (isInterviewSectionsWrapper(sections)) {
      return sections.interview_sections || [];
    }
    
    return [];
  };

  // Helper function for component to use
  const getInterviewSections = (): InterviewSection[] => {
    if (!persona || !persona.interview_sections) return [];
    return getInterviewSectionsArray(persona.interview_sections as unknown as InterviewSections);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="bg-gradient-to-b from-accent/30 via-background to-background pt-24">
          <div className="container px-4 mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/persona-viewer')}
              className="gap-2 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Personas
            </Button>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Progress value={75} className="w-64 mx-auto mb-4" />
                <p className="text-muted-foreground">Loading persona details...</p>
              </div>
            ) : !persona ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-bold mb-3">Persona Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The persona you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Button onClick={() => navigate('/persona-viewer')}>
                  View All Personas
                </Button>
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
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-3">Demographics</h2>
                      <ul className="space-y-2">
                        <li className="flex">
                          <span className="font-medium w-32">Age:</span>
                          <span>{persona.metadata.age}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Gender:</span>
                          <span>{persona.metadata.gender}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Location:</span>
                          <span>{persona.metadata.region}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Grew up in:</span>
                          <span>{persona.metadata.location_history?.grew_up_in}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Current home:</span>
                          <span>{persona.metadata.location_history?.current_residence}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold mb-3">Background</h2>
                      <ul className="space-y-2">
                        <li className="flex">
                          <span className="font-medium w-32">Occupation:</span>
                          <span>{persona.metadata.occupation}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Education:</span>
                          <span>{persona.metadata.education_level}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Income:</span>
                          <span>{persona.metadata.income_level}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Relationship:</span>
                          <span>{persona.metadata.relationship_status}</span>
                        </li>
                        <li className="flex">
                          <span className="font-medium w-32">Culture:</span>
                          <span>{persona.metadata.cultural_background}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <div>
                  <h2 className="text-2xl font-bold mb-4 font-plasmik">Interview Responses</h2>
                  
                  {getInterviewSections().map((section, index) => (
                    <Card key={index} className="mb-4 overflow-hidden">
                      <button
                        className="w-full p-4 flex justify-between items-center hover:bg-muted/30 transition-colors"
                        onClick={() => toggleSection(section.section)}
                      >
                        <h3 className="text-lg font-bold">{section.section}</h3>
                        {expandedSections[section.section] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      {expandedSections[section.section] && (
                        <div className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground italic mb-4">{section.notes}</p>
                          <div className="space-y-6">
                            {section.questions.map((item: any, qIndex: number) => {
                              // Handle both formats: object with question/response or just string questions
                              const question = typeof item === 'object' ? item.question : item;
                              const response = typeof item === 'object' ? item.response : 
                                (section.responses && section.responses[qIndex]);
                              
                              return (
                                <div key={qIndex}>
                                  <p className="font-medium mb-2">Q: {question}</p>
                                  {response ? (
                                    <p className="pl-4 border-l-2 border-primary/30 py-1">
                                      {response}
                                    </p>
                                  ) : (
                                    <p className="text-muted-foreground pl-4 border-l-2 border-muted py-1 italic">
                                      No response recorded
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
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
