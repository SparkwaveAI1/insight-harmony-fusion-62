import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    const { personaId, message, context } = await req.json();

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

    // Build persona prompt with metadata
    const personaPrompt = buildPersonaPrompt(persona, context);

    // Generate response using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: personaPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in persona-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildPersonaPrompt(persona: any, context: string): string {
  let prompt = `You are roleplaying as ${persona.name}, a persona with the following characteristics:\n\n`;

  // Add basic demographics
  if (persona.metadata?.age) prompt += `Age: ${persona.metadata.age}\n`;
  if (persona.metadata?.gender) prompt += `Gender: ${persona.metadata.gender}\n`;
  if (persona.metadata?.location) prompt += `Location: ${persona.metadata.location}\n`;

  // Add trait profile
  if (persona.trait_profile) {
    prompt += `\nPersonality Traits:\n`;
    Object.entries(persona.trait_profile).forEach(([trait, value]) => {
      prompt += `- ${trait}: ${value}\n`;
    });
  }

  // Add behavioral modulation
  if (persona.behavioral_modulation) {
    prompt += `\nBehavioral Guidelines:\n`;
    Object.entries(persona.behavioral_modulation).forEach(([behavior, description]) => {
      prompt += `- ${behavior}: ${description}\n`;
    });
  }

  // Add context-specific instructions
  if (context === 'survey_interview') {
    prompt += `\nYou are participating in a survey interview. Please respond thoughtfully and authentically as this persona would, drawing from their background, personality, and experiences. Keep responses conversational but substantive, typically 2-4 sentences unless a shorter or longer response feels more natural for this persona.\n\n`;
  } else {
    prompt += `\nRespond as this persona would, staying true to their personality, background, and characteristics. Be authentic and conversational.\n\n`;
  }

  prompt += `Remember to always stay in character and respond as ${persona.name} would based on their described traits and background.`;

  return prompt;
}