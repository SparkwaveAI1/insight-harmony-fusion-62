import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createEnhancedPersonaInstructions } from './enhancedPersonaInstructions.ts';
import { TraitRelevanceAnalyzer } from './traitRelevanceAnalyzer.ts';
import { DrivingTraitsSynthesizer } from './drivingTraitsSynthesizer.ts';
import { FocusedInstructions } from './focusedInstructions.ts';
import { TraitsFirstParameterEngine } from './traitsFirstParameterEngine.ts';

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
      mode = 'conversation',
      conversationContext = '',
      imageData
    } = await req.json();

    console.log('Quick chat request:', { personaId, messageLength: message.length, mode });

    // Fetch persona data from database
    const { data: persona, error: personaError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (personaError || !persona) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // TRAIT-FIRST RESPONSE SYSTEM - COMPLETE TRAIT PROCESSING
    console.log('🚀 Starting traits-first response generation with ALL traits...');
    
    // Extract complete trait profiles
    const completeTraitProfile = persona.trait_profile || {};
    const linguisticProfile = persona.linguistic_profile || {};
    
    console.log('🔍 Complete trait profile categories:', Object.keys(completeTraitProfile));
    
    // Generate system prompt from complete personality matrix
    console.log('📝 Building comprehensive persona instructions from complete trait profile...');
    const systemPrompt = FocusedInstructions.buildComprehensivePersonaInstructions(
      persona,
      completeTraitProfile,
      linguisticProfile,
      conversationContext || ''
    );
    console.log('✅ Complete personality-driven instructions built');
    
    console.log('System prompt length:', systemPrompt.length, 'characters');
    console.log('Conversation context included:', conversationContext ? 'YES' : 'NO', conversationContext ? `(${conversationContext.length} chars)` : '');

    // Build message history with proper image context preservation
    console.log('Building message history from', previousMessages.length, 'previous messages');
    const recentMessages = previousMessages.slice(-8);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((msg: any) => {
        const messageContent: any = { 
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content 
        };
        
        // Preserve image context in conversation history
        if (msg.image && msg.role === 'user') {
          messageContent.content = [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image } }
          ];
        }
        
        return messageContent;
      })
    ];
    
    console.log('Message history built with', messages.length, 'messages including system prompt');

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

    // Add image analysis instructions if image is present
    if (imageData) {
      const imageInstructions = `\n\n${'='.repeat(40)}\n📷 IMAGE ANALYSIS 📷\n${'='.repeat(40)}\n\nYou can see and analyze this image. Respond naturally based on your personality, background, and values.\nDon't be an objective image describer - be yourself looking at this image.\nYou have the ability to see and understand visual content when it's shared with you.\n${'='.repeat(40)}`;
      messages[0].content += imageInstructions;
    }

    // Generate AI parameters from complete personality matrix
    const aiParameters = TraitsFirstParameterEngine.synthesizeAIParameters(
      completeTraitProfile,
      linguisticProfile,
      null, // No filtered traits - use complete profile
      completeTraitProfile.dynamic_state || {}
    );
    
    console.log(`Complete personality-driven parameters: temp=${aiParameters.temperature}, tokens=${aiParameters.max_tokens}`);

    // Generate response with complete personality-driven parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Quality model for authentic responses
        messages,
        temperature: aiParameters.temperature,
        max_tokens: aiParameters.max_tokens,
        top_p: aiParameters.top_p,
        frequency_penalty: aiParameters.frequency_penalty,
        presence_penalty: aiParameters.presence_penalty,
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