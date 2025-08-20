import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, User, Sparkles } from "lucide-react";
import { PersonaV3Factory } from '@/services/persona/PersonaV3Factory';
import { createPersonaV3 } from '@/services/persona/personaV3Service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PersonaV3Creator() {
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreatePersona = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your persona');
      return;
    }

    setIsCreating(true);
    try {
      const factory = new PersonaV3Factory();
      const result = await factory.generatePersonaV3({
        prompt: prompt.trim()
      });

      const dbPersona = await createPersonaV3(result.persona);
      
      toast.success(`Created persona: ${result.persona.name}`);
      navigate(`/persona-detail/${result.persona.persona_id}`);
    } catch (error) {
      console.error('Error creating persona:', error);
      toast.error('Failed to create persona. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const examples = [
    "Create a 34-year-old environmental scientist named Dr. Sarah Chen who works for a renewable energy company and is passionate about climate action",
    "Make a 28-year-old freelance graphic designer from Portland who loves indie music and sustainable fashion",
    "Generate a 45-year-old high school teacher from rural Texas who coaches basketball and volunteers at the local food bank"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Create Persona V3</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe your ideal persona and we'll create a comprehensive psychological profile with detailed personality traits, cognitive patterns, and behavioral characteristics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persona Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your persona</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the person you want to create - their background, personality, interests, profession, etc. Be as detailed or brief as you like."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Be creative! The more details you provide, the richer your persona will be.</span>
              <span>{prompt.length}/2000</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Example Prompts</Label>
            <div className="grid gap-2">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left h-auto p-3 text-sm whitespace-normal"
                  onClick={() => handleExample(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreatePersona}
            disabled={isCreating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Persona...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Persona V3
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What's New in V3?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Enhanced Psychology</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive cognitive profiling including moral foundations, behavioral economics, and social identity traits.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Cultural Intelligence</h4>
              <p className="text-sm text-muted-foreground">
                Detailed cultural dimensions and socioeconomic context for authentic cross-cultural interactions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Memory System</h4>
              <p className="text-sm text-muted-foreground">
                Structured memory with long-term events, recall cues, and behavioral impact tracking.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Advanced Linguistics</h4>
              <p className="text-sm text-muted-foreground">
                Anti-mode collapse features and response shaping for more varied, natural conversations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}