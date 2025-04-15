
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Section from "@/components/ui-custom/Section";
import { toast } from "sonner";
import { generatePersona, savePersona } from "@/services/persona/personaService";

interface HeroSectionProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const HeroSection = ({ onGenerate, isGenerating }: HeroSectionProps) => {
  const [prompt, setPrompt] = useState("");
  const [generationStep, setGenerationStep] = useState("");
  const navigate = useNavigate();
  
  const handleGenerateClick = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your persona");
      return;
    }
    
    try {
      onGenerate(); // Start loading state
      setGenerationStep("Generating persona traits and psychological profile...");
      toast.info("Generating persona... This may take up to a minute.");
      
      console.log("Starting persona generation with prompt:", prompt);
      
      // Generate the persona using the OpenAI API
      const persona = await generatePersona(prompt);
      
      if (!persona) {
        throw new Error("Failed to generate persona");
      }
      
      console.log("Persona generated successfully:", persona);
      setGenerationStep("Persona generated. Saving to database...");
      
      console.log("Interview sections:", JSON.stringify(persona.interview_sections, null, 2));
      console.log("Now saving persona to Supabase...");
      
      // Save the persona to Supabase
      const savedPersona = await savePersona(persona);
      
      if (savedPersona) {
        console.log("Persona saved successfully with ID:", savedPersona.persona_id);
        setGenerationStep("Success! Redirecting to persona details...");
        toast.success("Persona generated successfully");
        
        // Navigate to the persona viewer page
        setTimeout(() => {
          navigate(`/persona-viewer/${savedPersona.persona_id}`);
        }, 1000);
      } else {
        console.error("Persona was generated but could not be saved");
        toast.error("Persona was generated but could not be saved");
      }
      
      // Reset form after successful generation
      setPrompt("");
    } catch (error) {
      console.error("Error generating persona:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate persona");
    } finally {
      // End loading state in parent component
      setGenerationStep("");
      setTimeout(() => {
        onGenerate();
      }, 500);
    }
  };

  return (
    <Section className="bg-gradient-to-b from-accent/50 via-background to-background pt-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center font-plasmik">
              Build a Behaviorally Accurate AI Persona
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Describe who you need. Our system will generate a simulated persona based on probabilistic 
              psychological modeling—ready for interviews, testing, or focus groups.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <Card className="p-6 mb-8">
              <label className="text-sm font-medium mb-2 block">Describe your persona:</label>
              <Textarea 
                placeholder="Example: 23-year-old Latina marketing associate from Arizona, distrusts politics, loves gaming"
                className="mb-4 min-h-[100px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <Button 
                onClick={handleGenerateClick}
                className="w-full" 
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    {generationStep || "Generating Persona"} 
                    <span className="ml-2 animate-pulse">...</span>
                  </>
                ) : (
                  <>Generate Persona</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will create a complete persona with demographic traits, psychological profile, and interview responses.
              </p>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/persona-viewer")}
                  className="text-sm"
                >
                  View Previously Generated Personas
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default HeroSection;
