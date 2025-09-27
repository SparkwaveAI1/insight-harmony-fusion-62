import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function V4Diagnostic() {
  const [personaId, setPersonaId] = useState('v4_1758673786354_lkpko3wzklm');
  const [userMessage, setUserMessage] = useState('What do you think about work-life balance?');
  const [result, setResult] = useState<any>(null);
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
          
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Running Diagnostic...' : 'Run Diagnostic'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}