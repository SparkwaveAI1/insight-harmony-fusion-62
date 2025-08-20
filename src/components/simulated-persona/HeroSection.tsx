
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, User, Brain, Upload } from "lucide-react";
import { usePersonaCreationProgress } from "@/hooks/usePersonaCreationProgress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import JSONImportDialog from "./JSONImportDialog";

interface HeroSectionProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const HeroSection = ({ onGenerate, isGenerating }: HeroSectionProps) => {
  const [prompt, setPrompt] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const navigate = useNavigate();
  const { createPersona, progress, isCreating } = usePersonaCreationProgress();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your persona");
      return;
    }

    console.log("=== HERO SECTION: Starting persona generation with progress ===");
    console.log("User prompt:", prompt);
    
    onGenerate();
    
    try {
      const persona = await createPersona(prompt.trim());
      
      if (persona) {
        console.log("✅ HERO SECTION: Persona generated successfully:", persona.name);
        console.log("✅ HERO SECTION: Persona ID:", persona.persona_id);
        
        // Navigate to the persona completion page with success state
        navigate("/persona-creation/complete", {
          state: {
            personaId: persona.persona_id,
            personaName: persona.name,
            error: false
          },
          replace: true
        });
      } else {
        console.error("❌ HERO SECTION: Persona generation returned null");
        
        // Navigate to completion page with error state
        navigate("/persona-creation/complete", {
          state: {
            error: true,
            errorMessage: "Failed to generate persona - no result returned"
          },
          replace: true
        });
      }
    } catch (error: any) {
      console.error("❌ HERO SECTION: Error during persona generation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      
      // Navigate to completion page with error state
      navigate("/persona-creation/complete", {
        state: {
          error: true,
          errorMessage: error.message || "An unexpected error occurred during persona generation"
        },
        replace: true
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-plasmik">
              Create AI-Powered
              <span className="text-primary block">Simulated Personas</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate detailed, psychologically accurate personas for research, testing, and insights. 
              Each persona includes comprehensive personality traits, behavioral patterns, and interview responses.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Describe Your Persona
              </CardTitle>
              <CardDescription>
                Provide details about the type of person you want to create. Include demographics, 
                personality traits, background, or any specific characteristics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., A 34-year-old marketing manager from Seattle who is environmentally conscious, tech-savvy, and values work-life balance. She has two young children and is interested in sustainable products..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isCreating}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerate}
                  className="flex-1" 
                  size="lg"
                  disabled={isCreating || !prompt.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Persona...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Persona
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                  size="lg"
                  disabled={isCreating}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Psychological Depth</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive personality traits and behavioral patterns
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Rich Demographics</h3>
              <p className="text-sm text-muted-foreground">
                Detailed background, lifestyle, and personal history
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Interview Ready</h3>
              <p className="text-sm text-muted-foreground">
                Pre-generated responses to common research questions
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <JSONImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </section>
  );
};

export default HeroSection;
