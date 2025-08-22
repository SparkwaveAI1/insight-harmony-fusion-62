import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendV4Message } from '@/services/v4-persona';
import { getV4Personas } from '@/services/v4-persona';
import { useAuth } from '@/context/AuthContext';

export function V4ConversationTest() {
  const { user } = useAuth();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    traits_used?: string[];
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  // Load V4 personas on component mount
  React.useEffect(() => {
    if (user) {
      loadV4Personas();
    }
  }, [user]);

  const loadV4Personas = async () => {
    try {
      const v4Personas = await getV4Personas(user!.id);
      setPersonas(v4Personas);
      console.log('Loaded V4 personas:', v4Personas.length);
    } catch (err) {
      console.error('Error loading V4 personas:', err);
      setError('Failed to load V4 personas');
    }
  };

  const sendMessage = async () => {
    if (!selectedPersonaId || !userMessage.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Add user message to conversation
      const newConversation = [...conversation, { role: 'user' as const, content: userMessage }];
      setConversation(newConversation);

      // Send to V4 conversation engine
      const response = await sendV4Message({
        persona_id: selectedPersonaId,
        user_message: userMessage,
        conversation_history: conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      if (response.success && response.response) {
        // Add persona response to conversation
        setConversation(prev => [...prev, {
          role: 'assistant' as const,
          content: response.response!,
          traits_used: response.traits_used
        }]);
        
        console.log('V4 conversation successful:', response.persona_name);
        console.log('Traits used:', response.traits_used);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }

      setUserMessage('');

    } catch (err) {
      console.error('Error in V4 conversation:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>V4 Conversation Engine Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Persona Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select V4 Persona:
            </label>
            <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a V4 persona to chat with..." />
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

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {conversation.map((message, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-8' 
                      : 'bg-white mr-8 border'
                  }`}>
                    <div className="font-medium text-sm text-gray-600 mb-1">
                      {message.role === 'user' ? 'You' : personas.find(p => p.persona_id === selectedPersonaId)?.name || 'Persona'}
                    </div>
                    <div>{message.content}</div>
                    {message.traits_used && (
                      <div className="text-xs text-gray-500 mt-2">
                        Traits used: {message.traits_used.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your message:
            </label>
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message to the persona..."
              rows={3}
              disabled={isLoading || !selectedPersonaId}
            />
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !selectedPersonaId || !userMessage.trim()}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
            
            {conversation.length > 0 && (
              <Button 
                onClick={clearConversation}
                variant="outline"
                disabled={isLoading}
              >
                Clear Chat
              </Button>
            )}
          </div>

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
                  <span>V4 conversation engine processing...</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Test Instructions:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Select a V4 persona from the dropdown</li>
              <li>Try different types of messages to test trait relevance</li>
              <li>Watch which traits are activated for each response</li>
              <li>Test topics like: goals, emotions, work, opinions, challenges</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}