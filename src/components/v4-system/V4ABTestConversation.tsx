import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendV4Message } from '@/services/v4-persona';
import { sendV4GrokMessage } from '@/services/v4-persona/conversationGrok';
import { getV4Personas } from '@/services/v4-persona';
import { useAuth } from '@/context/AuthContext';

export function V4ABTestConversation() {
  const { user } = useAuth();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [userMessage, setUserMessage] = useState('');
  const [openaiResponse, setOpenaiResponse] = useState<any>(null);
  const [grokResponse, setGrokResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (user) {
      loadV4Personas();
    }
  }, [user]);

  const loadV4Personas = async () => {
    try {
      const v4Personas = await getV4Personas(user!.id);
      setPersonas(v4Personas);
    } catch (err) {
      console.error('Error loading V4 personas:', err);
      setError('Failed to load V4 personas');
    }
  };

  const runABTest = async () => {
    if (!selectedPersonaId || !userMessage.trim()) return;

    setIsLoading(true);
    setError('');
    setOpenaiResponse(null);
    setGrokResponse(null);

    try {
      console.log('Running A/B test for:', userMessage);

      // Run both models in parallel
      const [openaiResult, grokResult] = await Promise.all([
        sendV4Message({
          persona_id: selectedPersonaId,
          user_message: userMessage
        }),
        sendV4GrokMessage({
          persona_id: selectedPersonaId,
          user_message: userMessage
        })
      ]);

      setOpenaiResponse(openaiResult);
      setGrokResponse(grokResult);

      console.log('A/B test completed');

    } catch (err) {
      console.error('Error in A/B test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = () => {
    setOpenaiResponse(null);
    setGrokResponse(null);
    setUserMessage('');
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>V4 A/B Test: OpenAI vs Grok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Persona Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select V4 Persona:
            </label>
            <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a V4 persona for A/B testing..." />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.persona_id}>
                    {persona.name} - {persona.conversation_summary?.demographics?.occupation || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Test message (will be sent to both models):
            </label>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="e.g., 'What do you think about immigration?'"
              rows={3}
              disabled={isLoading || !selectedPersonaId}
            />
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <Button 
              onClick={runABTest}
              disabled={isLoading || !selectedPersonaId || !userMessage.trim()}
              className="flex-1"
            >
              {isLoading ? 'Testing Both Models...' : 'Run A/B Test'}
            </Button>
            
            {(openaiResponse || grokResponse) && (
              <Button 
                onClick={clearTest}
                variant="outline"
                disabled={isLoading}
              >
                Clear Test
              </Button>
            )}
          </div>

          {/* Results Comparison */}
          {(openaiResponse || grokResponse) && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              
              {/* OpenAI Response */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">OpenAI GPT-4o-mini</CardTitle>
                </CardHeader>
                <CardContent>
                  {openaiResponse?.success ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-sm text-blue-700 mb-1">Response:</div>
                        <div>{openaiResponse.response}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Traits used: {openaiResponse.traits_selected?.join(', ') || 'none'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">Error: {openaiResponse?.error}</div>
                  )}
                </CardContent>
              </Card>

              {/* Grok Response */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grok Beta</CardTitle>
                </CardHeader>
                <CardContent>
                  {grokResponse?.success ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-sm text-green-700 mb-1">Response:</div>
                        <div>{grokResponse.response}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Traits used: {grokResponse.traits_selected?.join(', ') || 'none'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">Error: {grokResponse?.error}</div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="font-medium">Error:</div>
                <div>{error}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Running A/B test with both models...</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
}