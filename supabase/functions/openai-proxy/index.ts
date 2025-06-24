
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from '../_shared/cors.ts';
import { createUnifiedPersonaInstructions } from '../_shared/unifiedPersonaInstructions.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      persona_id, 
      user_message, 
      previous_messages = [], 
      persona_data,
      mode = 'conversation',
      conversation_context = '',
      image_data,
      temperature = 0.9,
      top_p = 0.95,
      frequency_penalty = 0.3,
      presence_penalty = 0.4
    } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!persona_data) {
      throw new Error('Persona data is required');
    }

    console.log('Processing request for persona:', persona_id, 'Mode:', mode);

    // Create unified system message with enhanced authenticity
    const systemMessage = createUnifiedPersonaInstructions(persona_data, {
      mode: mode,
      conversationContext: conversation_context,
      includeKnowledgeBoundaries: true,
      enhancedAuthenticity: true
    });

    console.log('Generated unified persona instructions for:', persona_data.name);

    // Build messages array
    const messages = [
      { role: 'system', content: systemMessage }
    ];

    // Add previous messages
    for (const msg of previous_messages) {
      messages.push({
        role: msg.role,
        content: msg.content,
        ...(msg.image && { image: msg.image })
      });
    }

    // Add current user message
    const userMessageContent = image_data 
      ? [
          { type: 'text', text: user_message },
          { type: 'image_url', image_url: { url: image_data } }
        ]
      : user_message;

    messages.push({
      role: 'user',
      content: userMessageContent
    });

    console.log('Calling OpenAI with unified authenticity parameters...');

    // Call OpenAI with enhanced parameters for authenticity
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: temperature, // Higher temperature for more creativity
        top_p: top_p, // More diverse token selection
        frequency_penalty: frequency_penalty, // Reduce repetitive phrases
        presence_penalty: presence_penalty, // Encourage new topics
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Generated unified authentic response for persona:', persona_id);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in openai-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
