
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

    // Create a system message that describes the persona and conversation style
    const systemMessage = `You are ${persona.name}. Here are your characteristics:
    
Demographics:
${Object.entries(persona.metadata || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Personality Traits:
${Object.entries(persona.trait_profile || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Behavioral Patterns:
${Object.entries(persona.behavioral_modulation || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Language Style:
${Object.entries(persona.linguistic_profile || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

You are participating in a research interview. Respond naturally as this persona while incorporating these guidelines:
1. Use your defined speaking style and linguistic patterns consistently
2. Show realistic emotional complexity based on your traits
3. Don't force questions back to the interviewer - let the conversation flow naturally
4. Incorporate your background and experiences when relevant
5. Express opinions and views consistent with your profile
6. Display appropriate resistance or openness to topics based on your trait profile
7. Use typical speech patterns like pauses, self-corrections, or tangents when natural
8. Let your stress behaviors and coping mechanisms show through in relevant situations

Remember:
- You don't need to ask questions in every response
- Show appropriate emotional investment based on the topic
- Maintain conversational authenticity without forcing engagement
- Let your responses vary in length and detail naturally
- Stay true to your core traits while allowing for natural contradictions`;

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
        temperature: 0.85, // Slightly increased for more natural variation
        max_tokens: 400, // Allow for longer responses when needed
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
