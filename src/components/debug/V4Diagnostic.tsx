import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function V4Diagnostic() {
  const [personaId, setPersonaId] = useState('v4_1758673786354_lkpko3wzklm');
  const [userMessage, setUserMessage] = useState('What do you like to eat?');
  const [result, setResult] = useState<any>(null);
  const [promptResult, setPromptResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('v4-diagnostic', {
        body: {
          persona_id: personaId,
          user_message: userMessage
        }
      });

      if (error) throw error;
      setResult(data);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runRealFunction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('v4-grok-conversation-clean', {
        body: {
          persona_id: personaId,
          user_message: userMessage,
          include_prompt: true // Debug flag to get the prompt
        }
      });

      if (error) throw error;
      setPromptResult(data);
    } catch (error) {
      console.error('Real function failed:', error);
      setPromptResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>V4 Trait Analysis Diagnostic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Persona ID</label>
            <Input
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              placeholder="Enter persona ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Test Message</label>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Enter test message"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={runDiagnostic} disabled={loading}>
              {loading ? 'Running...' : 'Run Diagnostic'}
            </Button>
            <Button onClick={runRealFunction} disabled={loading} variant="outline">
              {loading ? 'Running...' : 'Test Real Function (Debug Mode)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {promptResult && (
        <Card>
          <CardHeader>
            <CardTitle>Real Function Prompt (Debug Mode)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-96">
              {JSON.stringify(promptResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}