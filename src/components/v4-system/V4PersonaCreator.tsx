import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createV4PersonaCall1, createV4PersonaCall2 } from '@/services/v4-persona';
import { useAuth } from '@/context/AuthContext';

export function V4PersonaCreator() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [stage, setStage] = useState<'idle' | 'call1' | 'call2' | 'completed' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleCreatePersona = async () => {
    if (!user || !prompt.trim()) return;

    setIsCreating(true);
    setError('');
    setResult(null);

    try {
      // Call 1: Generate detailed traits
      setStage('call1');
      console.log('Starting Call 1...');
      
      const call1Response = await createV4PersonaCall1({
        user_prompt: prompt,
        user_id: user.id
      });

      if (!call1Response.success) {
        throw new Error(call1Response.error || 'Call 1 failed');
      }

      console.log('Call 1 successful:', call1Response);

      // Call 2: Generate summaries
      setStage('call2');
      console.log('Starting Call 2...');

      const call2Response = await createV4PersonaCall2(call1Response.persona_id!);

      if (!call2Response.success) {
        throw new Error(call2Response.error || 'Call 2 failed');
      }

      console.log('Call 2 successful:', call2Response);

      setStage('completed');
      setResult(call2Response);

    } catch (err) {
      console.error('Error creating V4 persona:', err);
      setStage('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'call1':
        return 'Generating detailed personality traits...';
      case 'call2':
        return 'Creating conversation summaries...';
      case 'completed':
        return 'Persona created successfully!';
      case 'error':
        return 'Error occurred during creation';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>V4 Persona Creator (Beta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe the persona you want to create:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A 35-year-old electrical contractor from North Carolina who served in the military and is interested in MMA training..."
              rows={4}
              disabled={isCreating}
            />
          </div>

          <Button 
            onClick={handleCreatePersona}
            disabled={isCreating || !prompt.trim() || !user}
            className="w-full"
          >
            {isCreating ? 'Creating Persona...' : 'Create V4 Persona'}
          </Button>

          {stage !== 'idle' && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Stage: {stage}</div>
                  <div>{getStageMessage()}</div>
                  {isCreating && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="font-medium">Error:</div>
                <div>{error}</div>
              </AlertDescription>
            </Alert>
          )}

          {result && stage === 'completed' && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Success!</div>
                  <div>Persona "{result.persona_name}" created successfully.</div>
                  <div className="text-sm text-gray-600">Persona ID: {result.persona_id}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}