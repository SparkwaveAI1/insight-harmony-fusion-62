
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createPersonaSystemMessage } from "../_shared/personaSystemMessage.ts";
import { generateChatResponse } from "../_shared/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, persona, previousMessages } = await req.json();
    console.log("Received request to generate persona response:", { message, persona: persona.name, messagesCount: previousMessages.length });

    const systemMessage = createPersonaSystemMessage(persona);

    const conversationMessages = [
      { role: "system", content: systemMessage },
      ...previousMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log("Sending request to OpenAI API with conversation history");
    
    const data = await generateChatResponse(conversationMessages, Deno.env.get('OPENAI_API_KEY') || '');
    const response = data.choices[0].message.content;

    console.log("Generated response:", response.substring(0, 50) + "...");

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-persona-response function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
