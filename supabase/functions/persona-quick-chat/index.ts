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
    const { 
      personaId, 
      message, 
      previousMessages = [], 
      conversationContext = '',
      imageData
    } = await req.json();

    console.log('Simple persona chat request:', { personaId, messageLength: message.length });

    // Try to fetch PersonaV2 first, fallback to old personas
    let persona = null;
    const { data: personaV2, error: v2Error } = await supabase
      .from('personas_v2')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (personaV2) {
      persona = personaV2;
      console.log('Using PersonaV2');
    } else {
      const { data: legacyPersona, error: legacyError } = await supabase
        .from('personas')
        .select('*')
        .eq('persona_id', personaId)
        .single();
      
      if (legacyPersona) {
        persona = legacyPersona;
        console.log('Using legacy persona');
      }
    }

    if (!persona) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract persona information for natural conversation
    const personaData = personaV2 ? personaV2.persona_data : persona;
    const personaName = personaData.identity?.name || persona.name || 'Assistant';
    const personaAge = personaData.identity?.age;
    const personaOccupation = personaData.identity?.occupation;
    const personaBackground = personaData.life_context?.background_narrative || personaData.background;
    const personaPersonality = personaData.cognitive_profile?.big_five || personaData.personality;

    // Build a natural system prompt based on persona characteristics
    let systemPrompt = `You are ${personaName}`;
    
    if (personaAge) {
      systemPrompt += `, ${personaAge} years old`;
    }
    
    if (personaOccupation) {
      systemPrompt += `, working as a ${personaOccupation}`;
    }
    
    systemPrompt += '. ';
    
    if (personaBackground) {
      systemPrompt += `Background: ${personaBackground}. `;
    }
    
    if (personaPersonality) {
      const personalityTraits = [];
      if (personaPersonality.extraversion > 0.6) personalityTraits.push('outgoing and social');
      if (personaPersonality.agreeableness > 0.6) personalityTraits.push('friendly and cooperative');
      if (personaPersonality.conscientiousness > 0.6) personalityTraits.push('organized and responsible');
      if (personaPersonality.neuroticism > 0.6) personalityTraits.push('thoughtful and sometimes anxious');
      if (personaPersonality.openness > 0.6) personalityTraits.push('creative and open to new experiences');
      
      if (personalityTraits.length > 0) {
        systemPrompt += `You are ${personalityTraits.join(', ')}. `;
      }
    }
    
    systemPrompt += 'Respond naturally and authentically in conversations, staying true to your character and background. Be conversational and engaging without using robotic phrases or formal announcements.';

    // Prepare conversation history
    const conversationMessages = [];
    
    // Add context if provided
    if (conversationContext) {
      conversationMessages.push({
        role: 'system',
        content: `Additional context for this conversation: ${conversationContext}`
      });
    }

    // Add previous messages
    if (previousMessages && previousMessages.length > 0) {
      conversationMessages.push(...previousMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    const userMessage: any = { role: 'user', content: message };
    
    // Handle image if provided
    if (imageData) {
      userMessage.content = [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: imageData } }
      ];
    }
    
    conversationMessages.push(userMessage);

    // Make simple OpenAI call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I cannot respond right now.';

    console.log('Simple persona chat completed successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      personaId,
      timestamp: new Date().toISOString(),
      metadata: {
        pipeline: 'simple'
      }
    }), {
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