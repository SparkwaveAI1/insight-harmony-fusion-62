
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const EXAMPLE_PROMPTS = [
  "A 28-year-old tech startup founder from San Francisco who's passionate about sustainability and rock climbing",
  "A 45-year-old high school teacher from rural Texas who loves gardening and coaches the debate team",
  "A 22-year-old college student studying psychology in Berlin, introverted but passionate about social justice",
  "A 35-year-old single parent working as a nurse in Chicago, optimistic despite daily challenges",
  "A 60-year-old retired mechanic from Australia who's learning to paint and loves fishing"
];

const SimplePersonaGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your persona');
      return;
    }

    if (prompt.trim().length < 20) {
      toast.error('Please provide a more detailed description (at least 20 characters)');
      return;
    }

    setIsGenerating(true);
    setGenerationStage('Preparing to generate persona...');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Please sign in to create personas');
        setIsGenerating(false);
        return;
      }

      setGenerationStage('Generating persona with AI...');
      
      const { data, error } = await supabase.functions.invoke('generate-persona', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        console.error('Error generating persona:', error);
        toast.error(error.message || 'Failed to generate persona');
        return;
      }

      if (!data?.success || !data?.persona) {
        console.error('No persona returned:', data);
        toast.error('Failed to generate persona - no data returned');
        return;
      }

      setGenerationStage('Persona generated successfully!');
      toast.success(`Created persona: ${data.persona.identity?.name || 'New Persona'}`);
      
      // Redirect to the persona's detail page or personas list
      setTimeout(() => {
        navigate('/personas');
      }, 1500);

    } catch (error) {
      console.error('Error during persona generation:', error);
      toast.error('Failed to generate persona. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Create AI Persona</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe the persona you want to create in natural language. Our AI will generate a complete, 
          realistic persona with personality traits, background, and behavioral patterns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe Your Persona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="persona-prompt">
              Persona Description
            </Label>
            <Textarea
              id="persona-prompt"
              placeholder="Describe the persona you want to create... Be specific about their age, location, occupation, personality traits, interests, and any other relevant details."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="min-h-[150px]"
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Be as detailed as possible for better results</span>
              <span>{prompt.length} characters</span>
            </div>
          </div>

          {!isGenerating && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Example Prompts (click to use):</Label>
              <div className="grid gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4 p-6 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Generating Persona...</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{generationStage}</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                This usually takes 30-60 seconds. We're creating a detailed persona with realistic traits, 
                background, and behavioral patterns.
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || prompt.trim().length < 20}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Persona...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Persona
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold">What you'll get:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete identity and demographic information</li>
                <li>• Detailed personality profile with Big Five traits</li>
                <li>• Realistic background story and life context</li>
                <li>• Social behavior patterns and communication style</li>
                <li>• Health profile and emotional triggers</li>
                <li>• Domain expertise and knowledge areas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplePersonaGenerator;
