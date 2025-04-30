
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePersona } from "@/services/persona/personaGenerator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = ({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) => {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your persona.",
        variant: "destructive"
      });
      return;
    }
    
    // Check authentication before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a persona.",
        variant: "destructive"
      });
      // Navigate to auth page - uncomment when auth page is implemented
      // navigate('/auth', { state: { returnTo: '/simulated-persona' } });
      return;
    }
    
    onGenerate(); // Toggle loading state
    
    try {
      console.log("Starting persona generation with prompt:", prompt);
      // Generate the persona
      const persona = await generatePersona(prompt);
      
      if (persona && persona.persona_id) {
        toast({
          title: "Persona Created",
          description: `Successfully created persona: ${persona.name || 'New Persona'}`,
        });
        
        console.log("Persona created successfully:", persona.persona_id);
        onGenerate(); // Toggle loading state back
        
        // Navigate to the success page with personaId
        navigate('/persona-creation/complete', { 
          state: { 
            personaId: persona.persona_id,
            personaName: persona.name || 'New Persona'
          }
        });
      } else {
        throw new Error("Failed to generate persona - no persona ID returned");
      }
    } catch (error) {
      console.error("Error creating persona:", error);
      // Get the detailed error message
      let errorMessage = "Failed to create persona. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check for specific database errors
        if (
          error.message.includes("column") ||
          error.message.includes("does not exist") ||
          error.message.includes("invalid input syntax")
        ) {
          errorMessage = `Database schema issue: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      onGenerate(); // Toggle loading state back
      
      // Navigate to the completion page with error state
      navigate('/persona-creation/complete', { 
        state: { 
          error: true, 
          errorMessage: errorMessage 
        } 
      });
    }
  };
  
  return (
    <div className="container px-4 mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">
          Build a Simulated Persona
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Use natural language to generate a realistic AI persona. Our system parses your input, rolls traits, and returns a fully interactive research subject—ready for interviews, group tests, or scenario simulations.
        </p>
        <form onSubmit={handleSubmit} className="bg-muted p-6 rounded-lg mb-8">
          <div className="mb-4">
            <label htmlFor="persona-prompt" className="block text-sm font-medium mb-2">
              Describe your persona
            </label>
            <textarea
              id="persona-prompt"
              className="w-full p-3 border rounded-md h-32 bg-background"
              placeholder="Example: Crypto-savvy Gen Z woman, skeptical of authority, loves sustainability"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Persona</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;
