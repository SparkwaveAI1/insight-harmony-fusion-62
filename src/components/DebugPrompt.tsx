import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendV4GrokMessage } from '@/services/v4-persona/conversationGrok';

export const DebugPrompt = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getPrompt = async () => {
    setLoading(true);
    try {
      const response = await sendV4GrokMessage({
        persona_id: "e5daef8f-b6f8-4768-9c3a-7e615dc23ee1", // Samuel Ortiz
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
      <Button onClick={getPrompt} disabled={loading}>
        {loading ? 'Getting Prompt...' : 'Get Raw Prompt'}
      </Button>
      
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