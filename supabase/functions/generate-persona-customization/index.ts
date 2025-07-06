
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalPersona, customizationNotes, newName } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create customization prompt
    const customizationPrompt = `
You are tasked with creating a customized persona based on an existing persona. You will receive:
1. An original persona with all their traits and characteristics
2. Customization instructions specifying what should be changed
3. A new name for the customized persona

IMPORTANT: You must preserve all the original persona's traits and characteristics EXCEPT for those specifically mentioned in the customization instructions.

Original Persona: ${JSON.stringify(originalPersona, null, 2)}

New Name: ${newName}

Customization Instructions: ${customizationNotes}

Generate a new persona that:
1. Keeps all original traits and characteristics unchanged UNLESS specifically mentioned in customization instructions
2. Applies the requested changes while maintaining internal consistency
3. Uses the new name provided
4. Maintains the same JSON structure as the original
5. Generates a new description (under 300 words) that reflects the customized persona

Return ONLY a valid JSON object with the complete customized persona data.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating psychologically accurate persona customizations. Always return valid JSON.'
          },
          {
            role: 'user',
            content: customizationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const customizedPersonaText = data.choices[0].message.content;

    let customizedPersona;
    try {
      customizedPersona = JSON.parse(customizedPersonaText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', customizedPersonaText);
      throw new Error('Failed to generate valid persona data');
    }

    // Ensure essential fields are present
    if (!customizedPersona.name) {
      customizedPersona.name = newName;
    }

    // Generate new persona ID
    const newPersonaId = `persona-${crypto.randomUUID().substring(0, 6)}`;
    customizedPersona.persona_id = newPersonaId;
    customizedPersona.creation_date = new Date().toISOString().split('T')[0];

    return new Response(
      JSON.stringify({ 
        success: true, 
        persona: customizedPersona 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-persona-customization:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
