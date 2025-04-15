
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, persona, previousMessages } = await req.json();
    console.log("Received request to generate persona response:", { message, persona: persona.name, messagesCount: previousMessages.length });

    // Create a system message that describes the persona
    const systemMessage = `You are ${persona.name}. Here are your characteristics:
    
Demographics:
${Object.entries(persona.metadata || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Personality Traits:
${Object.entries(persona.trait_profile || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Behavioral Patterns:
${Object.entries(persona.behavioral_modulation || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Language Style:
${Object.entries(persona.linguistic_profile || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Respond naturally as this persona, incorporating these characteristics into your responses.`;

    // Prepare the conversation history
    const conversationMessages = [
      { role: "system", content: systemMessage },
      ...previousMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    console.log("Sending request to OpenAI API with conversation history");
    
    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`OpenAI API error (${openAIResponse.status}):`, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const data = await openAIResponse.json();
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
