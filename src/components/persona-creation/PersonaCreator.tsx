import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonaV3Factory } from "@/services/persona/PersonaV3Factory";
import { savePersona } from "@/services/persona";
import { toast } from "sonner";
import { Loader2, Plus, Brain, Globe, MessageSquare } from "lucide-react";

const PersonaCreator = () => {
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreatePersona = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a persona description");
      return;
    }

    setIsCreating(true);
    
    try {
      // Generate persona using factory
      const factory = new PersonaV3Factory();
      const result = await factory.generatePersonaV3({ prompt });
      
      // Save to database
      const savedPersona = await savePersona({
        persona_id: result.persona.id,
        name: result.persona.name,
        description: prompt,
        persona_data: result.persona,
        is_public: false,
      });

      toast.success(`Persona "${result.persona.name}" created successfully!`);
      navigate(`/persona-detail/${savedPersona.persona_id}`);
    } catch (error) {
      console.error('Error creating persona:', error);
      toast.error("Failed to create persona. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground font-plasmik">
          Create AI Persona
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe the persona you want to create and our AI will generate a comprehensive psychological profile with advanced capabilities.
        </p>
      </div>

      {/* Example Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Example Prompts
          </CardTitle>
          <CardDescription>
            Click any example to get started, or write your own description below
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            "A 28-year-old sustainable fashion designer from Portland who is passionate about environmental activism and has anxiety about climate change",
            "A 45-year-old former military officer turned high school principal in rural Texas who values discipline and traditional family values",
            "A 22-year-old CS student from Mumbai who loves gaming, dreams of working at a tech giant, and struggles with imposter syndrome",
            "A 35-year-old single mother and nurse from Detroit who works night shifts and is pursuing a master's degree in healthcare administration"
          ].map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-left h-auto p-4 justify-start whitespace-normal"
              onClick={() => handleExample(example)}
            >
              {example}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Description</CardTitle>
          <CardDescription>
            Describe your persona in detail. Include demographics, personality traits, background, goals, and any specific characteristics you want them to have.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the persona you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {prompt.length} characters
            </span>
            <Button 
              onClick={handleCreatePersona}
              disabled={isCreating || !prompt.trim()}
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Persona...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Persona
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            What's New in V3?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Enhanced Psychology</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced cognitive profiling with Big Five traits, moral foundations, and decision-making styles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Cultural Intelligence</h4>
                <p className="text-sm text-muted-foreground">
                  Sophisticated cultural context and social cognition modeling
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Memory System</h4>
                <p className="text-sm text-muted-foreground">
                  Dynamic memory with emotional triggers and behavioral contradictions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Advanced Linguistics</h4>
                <p className="text-sm text-muted-foreground">
                  Sophisticated communication patterns and response shaping
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonaCreator;