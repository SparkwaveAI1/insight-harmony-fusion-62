import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendV4GrokMessage } from '@/services/v4-persona/conversationGrok';
import { supabase } from '@/integrations/supabase/client';

export const DebugPrompt = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [personaInput, setPersonaInput] = useState<string>('Samuel Ortiz');

  const getPrompt = async () => {
    setLoading(true);
    try {
      // Resolve persona by name/UUID/V4 ID
      const input = personaInput.trim();
      const { data } = await supabase
        .from('v4_personas')
        .select('persona_id')
        .or(`persona_id.eq.${input},id.eq.${input},name.ilike.%${input}%`)
        .limit(1);
      
      const persona_id = data?.[0]?.persona_id ?? input;

      const response = await sendV4GrokMessage({
        persona_id,
        user_message: "What do you think about AI in radiology?",
        conversation_history: [],
        include_prompt: true
      });

      console.log('=== RAW PROMPT DEBUG RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      
      // @ts-ignore
      if (response.prompt_debug && response.prompt_debug.instructions) {
        // @ts-ignore
        setPrompt(response.prompt_debug.instructions);
        // @ts-ignore
        console.log('=== RAW PROMPT INSTRUCTIONS ===');
        // @ts-ignore
        console.log(response.prompt_debug.instructions);
        console.log('=== END RAW PROMPT ===');
      } else {
        setPrompt('No prompt_debug.instructions found in response');
      }
    } catch (error) {
      console.error('Error getting prompt:', error);
      setPrompt('Error: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Persona name, UUID, or v4_* ID"
          value={personaInput}
          onChange={(e) => setPersonaInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={getPrompt} disabled={loading}>
          {loading ? 'Getting Prompt...' : 'Get Raw Prompt'}
        </Button>
      </div>
      
      {prompt && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Raw Prompt Instructions:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
};