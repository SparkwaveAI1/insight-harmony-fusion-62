import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Pause, Play, RefreshCw } from 'lucide-react';

interface BatchState {
  current: number;
  total: number;
  currentName: string;
  failures: Array<{ id: string; name: string; error: string }>;
}

export function BatchImageGenerator() {
  const [processing, setProcessing] = useState(false);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [state, setState] = useState<BatchState>({ 
    current: 0, total: 0, currentName: '', failures: [] 
  });
  const { toast } = useToast();

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  const processImages = async () => {
    setProcessing(true);
    isPausedRef.current = false;
    setIsPaused(false);
    
    // Fetch personas missing images
    const { data: personas, error } = await supabase
      .from('v4_personas')
      .select('persona_id, full_profile, conversation_summary')
      .is('profile_image_url', null)
      .limit(100);

    if (error || !personas?.length) {
      toast({ 
        title: personas?.length === 0 ? "All personas have images" : "Error fetching personas",
        description: error?.message,
        variant: personas?.length === 0 ? "default" : "destructive"
      });
      setProcessing(false);
      return;
    }

    setState(prev => ({ ...prev, total: personas.length, current: 0, failures: [] }));

    const failures: Array<{ id: string; name: string; error: string }> = [];

    for (let i = 0; i < personas.length; i++) {
      // Check pause state
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const persona = personas[i];
      const conversationSummary = persona.conversation_summary as Record<string, unknown> | null;
      const fullProfile = persona.full_profile as Record<string, unknown> | null;
      const identity = fullProfile?.identity as Record<string, unknown> | null;
      
      const name = (conversationSummary?.name as string) || 
                   (identity?.name as string) || 
                   'Unknown';
      
      setState(prev => ({ ...prev, current: i + 1, currentName: name }));

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'generate-persona-image',
          { body: { personaData: persona } }
        );

        if (fnError || !data?.success) {
          failures.push({ 
            id: persona.persona_id, 
            name, 
            error: fnError?.message || data?.error || 'Unknown error' 
          });
          setState(prev => ({ ...prev, failures: [...failures] }));
        }
        // Edge function updates the database with profile_image_url and profile_thumbnail_url
      } catch (err) {
        failures.push({ 
          id: persona.persona_id, 
          name, 
          error: String(err) 
        });
        setState(prev => ({ ...prev, failures: [...failures] }));
      }

      // Rate limit: 3 second delay between calls
      if (i < personas.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setProcessing(false);
    toast({
      title: "Batch Complete",
      description: `Processed ${personas.length} personas. ${failures.length} failures.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Batch Image Generator
        </CardTitle>
        <CardDescription>
          Generate profile images for personas missing them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar and status */}
        {state.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {state.current} / {state.total}</span>
              {state.currentName && <span className="text-muted-foreground">Current: {state.currentName}</span>}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(state.current / state.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Failures list */}
        {state.failures.length > 0 && (
          <div className="text-sm text-destructive">
            <p className="font-medium">Failures ({state.failures.length}):</p>
            <ul className="list-disc list-inside max-h-32 overflow-y-auto">
              {state.failures.map(f => (
                <li key={f.id}>{f.name}: {f.error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={processImages} disabled={processing}>
            {processing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {processing ? 'Processing...' : 'Generate Missing Images'}
          </Button>
          
          {processing && (
            <Button 
              variant="outline" 
              onClick={togglePause}
            >
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
