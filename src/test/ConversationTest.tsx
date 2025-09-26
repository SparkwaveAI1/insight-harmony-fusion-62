import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ConversationTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testMetaphorFix = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing metaphor fix with Daniel Petrov...');
      
      const { data, error } = await supabase.functions.invoke('v4-grok-conversation', {
        body: {
          persona_id: 'v4_1758410960322_nnursb8xk9', // Daniel Petrov
          user_message: 'What do you think about AI in healthcare?',
          include_prompt: true // This should return the prompt for inspection
        }
      });

      if (error) {
        console.error('❌ Conversation test error:', error);
        setResult({ error: error.message });
      } else {
        console.log('✅ Conversation test result:', data);
        setResult(data);
        
        // Check if metaphor instructions are present
        if (data.prompt_debug) {
          const hasMetaphorIssue = data.prompt_debug.instructions.includes('metaphor domains from your profile') ||
                                   data.prompt_debug.instructions.includes('Use vivid metaphors') ||
                                   data.prompt_debug.instructions.includes('paint pictures with words');
          console.log('🔍 Metaphor check:', hasMetaphorIssue ? '❌ Still present' : '✅ Fixed');
        }
      }
    } catch (err) {
      console.error('❌ Test failed:', err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const testDifferentPersonas = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing trait differentiation...');
      
      const personas = [
        { id: 'v4_1758410960322_nnursb8xk9', name: 'Daniel Petrov' },
        { id: 'v4_1758673563948_3j4aucapmuw', name: 'Caroline Wu' },
        { id: 'v4_1758659990499_vh84hk7ofse', name: 'Dr. Leonard Price' }
      ];

      const responses: any = {};
      
      for (const persona of personas) {
        const { data, error } = await supabase.functions.invoke('v4-grok-conversation', {
          body: {
            persona_id: persona.id,
            user_message: 'What do you think about AI replacing human jobs?',
            conversation_history: []
          }
        });
        
        if (error) {
          responses[persona.name] = { error: error.message };
        } else {
          responses[persona.name] = {
            response: data.response,
            traits_used: data.traits_selected,
            model: data.model_used
          };
        }
        
        // Small delay between calls
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setResult({ persona_responses: responses });
      console.log('✅ Trait differentiation test completed:', responses);
      
    } catch (err) {
      console.error('❌ Differentiation test failed:', err);
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Conversation Engine Test</h2>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testMetaphorFix} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Metaphor Fix (Debug Prompt)'}
        </Button>
        
        <Button 
          onClick={testDifferentPersonas} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Trait Differentiation (3 Personas)'}
        </Button>
      </div>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <Textarea 
            value={JSON.stringify(result, null, 2)} 
            readOnly
            className="h-96 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}