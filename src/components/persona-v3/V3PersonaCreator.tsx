import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { saveV3Persona } from "@/services/persona/v3Operations/saveV3Persona";
import { PersonaV3 } from "@/types/persona-v3";

interface V3PersonaCreatorProps {
  onPersonaCreated?: (persona: PersonaV3) => void;
}

export function V3PersonaCreator({ onPersonaCreated }: V3PersonaCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your persona",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create personas",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('🚀 V3-Clean: Starting persona generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-persona-v3-clean', {
        body: { 
          prompt: prompt.trim(),
          userId: user.id
        }
      });

      if (error) {
        console.error('❌ V3-Clean: Generation error:', error);
        throw new Error(error.message || 'Generation failed');
      }

      if (!data) {
        throw new Error('No persona data received');
      }

      console.log('✅ V3-Clean: Generation successful:', data.name);

      // Save to database
      const saveResult = await saveV3Persona(data as PersonaV3);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save persona');
      }

      toast({
        title: "Persona Created!",
        description: `${data.name} has been generated successfully`,
      });

      onPersonaCreated?.(data as PersonaV3);
      setPrompt(""); // Clear the form

    } catch (error) {
      console.error('❌ V3-Clean: Creation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to create persona",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          V3 Persona Creator
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">BETA</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create authentic, diverse personas with our new V3-Clean generation system
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Persona Description</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the persona you want to create... (e.g., 'A 35-year-old software engineer from Tokyo who loves cooking and has two kids')"
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
        </div>
        
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Persona...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate V3 Persona
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="text-center text-sm text-muted-foreground">
            Creating a diverse, authentic persona... This usually takes 8-12 seconds.
          </div>
        )}
      </CardContent>
    </Card>
  );
}