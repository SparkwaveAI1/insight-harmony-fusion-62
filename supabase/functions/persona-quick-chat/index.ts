import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createStreamlinedPersonaInstructions } from './streamlinedPersonaInstructions.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaId, message, previousMessages = [], mode = 'conversation' } = await req.json();

    console.log('Quick chat request:', { personaId, messageLength: message.length, mode });

    // Fetch persona data
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (personaError || !persona) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build streamlined persona prompt
    const systemPrompt = createStreamlinedPersonaInstructions(persona, mode);
    
    console.log('System prompt length:', systemPrompt.length, 'characters');

    // Build message history (last 8 messages only for speed)
    const recentMessages = previousMessages.slice(-8);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Generate response with optimized parameters for speed
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast model
        messages,
        temperature: 0.9, // High for personality
        max_tokens: 600, // Shorter responses for speed
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('Response generated, length:', generatedResponse.length);

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in persona-quick-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});