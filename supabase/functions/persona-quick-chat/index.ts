import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createEnhancedPersonaInstructions } from './enhancedPersonaInstructions.ts';
import { TraitRelevanceAnalyzer } from './traitRelevanceAnalyzer.ts';
import { DrivingTraitsSynthesizer } from './drivingTraitsSynthesizer.ts';
import { FocusedInstructions } from './focusedInstructions.ts';

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

// Simple hash function for conversation context
function hashContext(context: string): string {
  let hash = 0;
  for (let i = 0; i < context.length; i++) {
    const char = context.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function getCachedPersona(personaId: string, conversationContext: string = ''): { persona: any, instructions: string } | null {
  // Include personaId in the context hash to prevent cross-contamination between personas
  // This ensures each persona gets unique cache entries even with identical material contexts
  const contextWithPersona = `${conversationContext}-persona:${personaId}`;
  const contextHash = hashContext(contextWithPersona);
  const cacheKey = `${personaId}-${contextHash}`;
  const cached = personaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached persona data for:', personaId, 'with unique context hash:', contextHash);
    return { persona: cached.persona, instructions: cached.instructions };
  }
  return null;
}

function setCachedPersona(personaId: string, conversationContext: string = '', persona: any, instructions: string): void {
  // Include personaId in the context hash to prevent cross-contamination between personas
  const contextWithPersona = `${conversationContext}-persona:${personaId}`;
  const contextHash = hashContext(contextWithPersona);
  const cacheKey = `${personaId}-${contextHash}`;
  personaCache.set(cacheKey, {
    persona,
    instructions,
    timestamp: Date.now()
  });
  console.log('Cached persona data for:', personaId, 'with unique context hash:', contextHash);
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
    
    const cached = getCachedPersona(personaId, conversationContext);
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
      
      // TRAIT-FIRST RESPONSE SYSTEM
      console.log('🚀 Starting trait-first response generation...');
      
      // DEBUG: Log trait profile structure to understand what we're working with
      console.log('🔍 DEBUG: Trait profile keys:', persona.trait_profile ? Object.keys(persona.trait_profile) : 'null');
      if (persona.trait_profile?.big_five) {
        console.log('🔍 DEBUG: Big Five values:', {
          openness: persona.trait_profile.big_five.openness,
          conscientiousness: persona.trait_profile.big_five.conscientiousness,
          extraversion: persona.trait_profile.big_five.extraversion,
          agreeableness: persona.trait_profile.big_five.agreeableness,
          neuroticism: persona.trait_profile.big_five.neuroticism
        });
      }
      
      // Step 1: Comprehensive trait relevance analysis
      const traitScanResult = await TraitRelevanceAnalyzer.analyzeTraitRelevance(
        message,
        conversationContext || '',
        persona.trait_profile
      );
      
      console.log(`📊 Trait scan: ${traitScanResult.totalScanned} traits, ${traitScanResult.highPriorityTraits.length} high-priority`);
      
      // Step 2: Synthesize driving traits from high-priority candidates
      const drivingTraitsProfile = await DrivingTraitsSynthesizer.synthesizeDrivingTraits(
        traitScanResult.highPriorityTraits,
        persona.trait_profile,
        message
      );
      
      console.log(`🎯 Driving traits: ${drivingTraitsProfile.primaryTraits.map(t => t.subcategory).join(', ')}`);
      
      // Step 3: Generate focused instructions using only driving traits
      systemPrompt = FocusedInstructions.buildFocusedPersonaInstructions(
        persona,
        drivingTraitsProfile,
        conversationContext || ''
      );
      
      // Cache for future requests with context-aware cache key
      setCachedPersona(personaId, conversationContext, persona, systemPrompt);
    }
    
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

    // AGGRESSIVE trait-driven generation parameters
    const bigFive = persona.trait_profile?.big_five || {};
    const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
    const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
    const extraversion = parseFloat(bigFive.extraversion || '0.5');
    const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
    const openness = parseFloat(bigFive.openness || '0.5');
    
    // MUCH more aggressive trait-responsive parameters
    let temperature = 0.8; // Base temperature
    if (conscientiousness < 0.3) temperature = 1.1; // Very disorganized = very random
    if (conscientiousness > 0.7) temperature = 0.6; // Very organized = more focused
    if (neuroticism > 0.7) temperature += 0.2; // Neurotic = more erratic
    if (openness > 0.7) temperature += 0.15; // Open = more creative
    if (openness < 0.3) temperature -= 0.15; // Closed = more predictable
    temperature = Math.max(0.4, Math.min(1.2, temperature));
    
    // Much more aggressive token limits
    let maxTokens = 800; // Base limit
    if (extraversion < 0.3) maxTokens = 150; // Very introverted = very brief
    if (extraversion > 0.7) maxTokens = 1500; // Very extraverted = very verbose
    if (conscientiousness < 0.3) maxTokens = Math.min(maxTokens, 400); // Disorganized = shorter
    
    // Personality-driven penalties
    const frequencyPenalty = neuroticism > 0.7 ? 0.05 : 0.25; // Neurotic = repeat concerns
    const presencePenalty = agreeableness < 0.3 ? 0.6 : 0.2; // Disagreeable = focus on problems
    
    console.log(`Trait-responsive parameters: temp=${temperature}, tokens=${maxTokens}, neuroticism=${neuroticism}`);

    // Generate response with trait-driven parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Quality model for authentic responses
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
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