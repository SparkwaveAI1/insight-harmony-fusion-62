import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎭 Voicepack chat edge function called');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { 
      messages, 
      temperature = 0.7, 
      presence_penalty = 0.0, 
      frequency_penalty = 0.0, 
      max_tokens = 150,
      image_data = null
    } = await req.json();

    console.log('Request params:', {
      messageCount: messages?.length,
      temperature,
      presence_penalty,
      frequency_penalty,
      max_tokens,
      hasImageData: !!image_data
    });

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Build OpenAI messages, handling image data if present
    const openAIMessages = messages.map((msg: any) => {
      if (msg.role === 'user' && image_data) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: msg.content },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image_data}`
              }
            }
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });

    console.log('Calling OpenAI with voicepack-optimized parameters');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use legacy model for now since it supports temperature
        messages: openAIMessages,
        temperature,
        presence_penalty,
        frequency_penalty,
        max_tokens,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    const generatedResponse = data.choices[0].message.content;
    
    console.log('✅ Voicepack chat response generated successfully');
    console.log('Response length:', generatedResponse.length);

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in persona-voicepack-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});