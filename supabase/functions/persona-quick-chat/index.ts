import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createComprehensiveStreamlinedInstructions } from './comprehensiveStreamlinedInstructions.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for persona data and processed instructions
const personaCache = new Map<string, { 
  persona: any, 
  instructions: string, 
  timestamp: number 
}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

function getCachedPersona(personaId: string): { persona: any, instructions: string } | null {
  const cached = personaCache.get(personaId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached persona data for:', personaId);
    return { persona: cached.persona, instructions: cached.instructions };
  }
  return null;
}

function setCachedPersona(personaId: string, persona: any, instructions: string): void {
  personaCache.set(personaId, {
    persona,
    instructions,
    timestamp: Date.now()
  });
  console.log('Cached persona data for:', personaId);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      personaId, 
      message, 
      previousMessages = [], 
      mode = 'conversation',
      conversationContext = '',
      imageData
    } = await req.json();

    console.log('Quick chat request:', { personaId, messageLength: message.length, mode });

    // Check cache first
    let persona: any;
    let systemPrompt: string;
    
    const cached = getCachedPersona(personaId);
    if (cached) {
      persona = cached.persona;
      systemPrompt = cached.instructions;
    } else {
      // Fetch persona data from database
      const { data: fetchedPersona, error: personaError } = await supabase
        .from('personas')
        .select('*')
        .eq('persona_id', personaId)
        .single();

      if (personaError || !fetchedPersona) {
        return new Response(JSON.stringify({ error: 'Persona not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      persona = fetchedPersona;
      // Pre-process persona instructions with context and mode
      systemPrompt = createComprehensiveStreamlinedInstructions(persona, mode, conversationContext);
      
      // Cache for future requests (note: context-specific, so cache key should include context)
      setCachedPersona(personaId, persona, systemPrompt);
    }
    
    console.log('System prompt length:', systemPrompt.length, 'characters');

    // Build message history (last 8 messages only for speed)
    const recentMessages = previousMessages.slice(-8);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Add current user message with potential image data
    const userMessage: any = { role: 'user' };
    if (imageData) {
      userMessage.content = [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: imageData } }
      ];
    } else {
      userMessage.content = message;
    }
    messages.push(userMessage);

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
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`AI service temporarily unavailable`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('Response generated, length:', generatedResponse.length);

    return new Response(JSON.stringify({ response: generatedResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in persona-quick-chat function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});