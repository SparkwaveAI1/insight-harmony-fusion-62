import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const grokApiKey = Deno.env.get('GROK_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona_id, user_message, conversation_history, conversation_context, image_data } = await req.json();

    console.log('V4 Persona Adapter: Processing request for persona:', persona_id);

    // Handle adapted persona IDs (remove v4_adapted_ prefix to get original)
    let actualPersonaId = persona_id;
    if (persona_id.startsWith('v4_adapted_')) {
      actualPersonaId = persona_id.replace('v4_adapted_', '');
      console.log('Adapted persona ID detected, using:', actualPersonaId);
    }

    // Fetch the actual persona from database
    const { data: personaData, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', actualPersonaId)
      .single();

    if (personaError || !personaData) {
      console.error('Error fetching persona:', personaError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Persona not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log('Found persona:', personaData.name);

    // Build conversation context for Grok
    const systemPrompt = `You are ${personaData.name}, a persona for research purposes. 

PERSONA BACKGROUND:
${personaData.biographical_info || personaData.description}

PERSONALITY TRAITS:
${JSON.stringify(personaData.traits || {}, null, 2)}

COMMUNICATION STYLE:
- Be authentic and natural in your responses
- Draw from your background and experiences
- Express opinions based on your personality and values
- Keep responses conversational and engaging
- Avoid being overly formal or robotic

${conversation_context ? `\nCONTEXT: ${conversation_context}` : ''}

Respond as this persona would naturally respond, incorporating their personality, background, and communication style.`;

    // Prepare messages for Grok API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (conversation_history && conversation_history.length > 0) {
      conversation_history.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: user_message
    });

    console.log('Sending to Grok API with', messages.length, 'messages');

    // Call Grok API
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.8,
        top_p: 0.9
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('Grok API error:', errorText);
      throw new Error(`Grok API error: ${grokResponse.status} ${errorText}`);
    }

    const grokData = await grokResponse.json();
    const response = grokData.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from Grok API');
    }

    console.log('V4 Persona Adapter: Generated response length:', response.length);

    return new Response(JSON.stringify({
      success: true,
      response: response,
      persona_name: personaData.name,
      model_used: 'grok-via-v4-adapter'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('V4 Persona Adapter error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});