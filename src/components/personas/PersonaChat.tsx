import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendV4Message } from '@/services/v4-persona';
import { useAuth } from '@/context/AuthContext';
import { checkUserCredits } from '@/utils/creditCheck';
import { toast } from 'sonner';

interface PersonaChatProps {
  persona: any; // V4 persona object
  personaId: string; // V4 persona_id
  title?: string; // Optional custom title
  height?: string; // Optional height control
}

export function PersonaChat({ persona, personaId, title, height = "h-96" }: PersonaChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    traits_used?: string[];
  }>>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    // Check if user has enough credits for conversation message
    if (user) {
      const { hasEnoughCredits, currentBalance } = await checkUserCredits(user.id, 2);

      if (!hasEnoughCredits) {
        toast(`Insufficient credits. Need 2 credits to send message, you have ${currentBalance}. Please purchase more credits.`, {
          description: "Conversation messages require 2 credits.",
          action: {
            label: "View Billing",
            onClick: () => window.location.href = "/billing"
          }
        });
        return; // Stop message sending
      }
    }

    setIsLoading(true);
    setError('');

    try {
      // Add user message to conversation
      const newUserMessage = {
        role: 'user' as const,
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMessage]);

      // Send to V4 conversation engine
      const response = await sendV4Message({
        persona_id: personaId,
        user_message: userMessage,
        conversation_history: messages
          .filter(msg => msg.role !== 'system') // Filter out system messages for API
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      });

      if (response.success && response.response) {
        // Add persona response to conversation
        const personaResponse = {
          role: 'assistant' as const,
          content: response.response,
          timestamp: new Date().toISOString(),
          traits_used: response.traits_selected
        };
        setMessages(prev => [...prev, personaResponse]);
        
        console.log('V4 conversation successful:', response.persona_name);
        console.log('Traits used:', response.traits_selected);
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
    setMessages([]);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {title || `Chat with ${persona?.name || 'Persona'}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Conversation History */}
        <div className={`border rounded-lg p-4 ${height} overflow-y-auto bg-gray-50`}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {persona?.name}</p>
              <p className="text-sm">Try asking about their goals, work, or opinions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 ml-8' 
                    : message.role === 'system'
                    ? 'bg-red-100 mr-8'
                    : 'bg-white mr-8 border'
                }`}>
                  <div className="font-medium text-sm text-gray-600 mb-1">
                    {message.role === 'user' ? 'You' : 
                     message.role === 'system' ? 'System' : 
                     persona?.name || 'Persona'}
                  </div>
                  <div>{message.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div>
          <Textarea
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type your message to ${persona?.name}...`}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Controls */}
        <div className="flex space-x-2">
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !userMessage.trim()}
            className="flex-1"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
          
          {messages.length > 0 && (
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

      </CardContent>
    </Card>
  );
}