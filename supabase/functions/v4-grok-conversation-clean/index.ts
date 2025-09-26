// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TraitAnalysisEngine } from './traitAnalysisEngine.ts';

// CLEAN VERSION - NO BILLING DEPENDENCIES
console.log('🔥 DEPLOYMENT TEST - Edge function is live and updated!');

// Flags (default OFF)
const CE_PROMPT_V2 = Deno.env.get("CE_PROMPT_V2") === "true";
const CE_OPENING_DEDUPE_RETRY = Deno.env.get("CE_OPENING_DEDUPE_RETRY") === "true";
const GROK_MODEL = Deno.env.get("GROK_MODEL") ?? "grok-4-latest";

// Log configuration at boot
console.log(`Grok model: ${GROK_MODEL}, CE_PROMPT_V2=${CE_PROMPT_V2}`);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Safe extractors to replace JSON.stringify on complex objects
function asList(x: any): string {
  return Array.isArray(x) ? x.join(", ") : (typeof x === "string" ? x : "");
}

function field(obj: any, key: string): string {
  const v = obj?.[key];
  return (v == null) ? "" : (typeof v === "string" ? v : Array.isArray(v) ? asList(v) : "");
}

// Using helper functions from top of file

function extractDemographics(conversationSummary, fullProfile) {
  // Try conversation summary first, then fallback to full profile
  const demographics = conversationSummary?.demographics || {};
  const identity = fullProfile?.identity || {};
  
  return {
    name: demographics.name || identity.name || 'Unknown',
    age: demographics.age || identity.age || 'Unknown',
    ethnicity: demographics.ethnicity || identity.ethnicity || 'Unknown', 
    occupation: demographics.occupation || identity.occupation || 'Unknown',
    location: demographics.location || identity.location?.city || 'Unknown'
  };
}

// V4-Native instruction builder using trait analysis results
function buildV4NativeInstructions(v4Analysis, conversationSummary, userInput, fullProfile) {
  const demographics = extractDemographics(conversationSummary, fullProfile);
  const selectedTraits = v4Analysis.selected_traits || [];
  
  // Generate specific opinion
  const specificOpinion = synthesizeSpecificOpinion(selectedTraits, userInput, demographics);
  
  // Build communication execution
  const communicationExecution = buildCommunicationExecution(
    selectedTraits, 
    demographics, 
    fullProfile.communication_style
  );
  
  // Forbidden phrases
  const forbiddenPhrases = [
    "That said...", "However...", "On the other hand...",
    "Overall...", "Ultimately...", "At the end of the day...",
    "Game-changer", "Double-edged sword", "Invaluable tool",
    "Cautiously optimistic", "Measured approach"
  ];
  
  const instructions = `IDENTITY: You are ${demographics.name}, a ${demographics.age}-year-old ${demographics.ethnicity} ${demographics.occupation} living in ${demographics.location}.

CRITICAL: Answer in character with your unique voice and style.

YOUR STANCE: ${specificOpinion}

HOW TO EXPRESS THIS: ${communicationExecution}

RESPONSE REQUIREMENTS:
- 2-4 sentences maximum
- No diplomatic hedging or balanced conclusions
- Express YOUR specific viewpoint authentically

FORBIDDEN PHRASES: Never use these AI-slop terms:
${forbiddenPhrases.map(phrase => `- "${phrase}"`).join('\n')}

You are a real person with specific opinions, not a diplomatic AI assistant.`;

  return instructions;
}

function synthesizeSpecificOpinion(selectedTraits, userInput, demographics) {
  // Use TraitAnalysisEngine for opinion generation
  return TraitAnalysisEngine.synthesizeQualitativeOpinion(selectedTraits, userInput);
}

function buildCommunicationExecution(selectedTraits, demographics, communicationStyle) {
  // Use TraitAnalysisEngine for communication style
  const fullProfile = { 
    identity: demographics,
    communication_style: communicationStyle 
  };
  return TraitAnalysisEngine.synthesizeCommunicationStyle(selectedTraits, fullProfile);
}

serve(async (req) => {
  console.log("V4 GROK Conversation Engine - Processing:", req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona_id, user_message, conversation_history = [], include_prompt = false, include_debug = false } = await req.json();

    if (!persona_id || !user_message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: persona_id and user_message'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple credit check - no billing blocking for now
    console.log("Processing request for persona:", persona_id);

    // Fetch persona data
    const { data: persona, error: personaError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single();
      
    if (personaError || !persona) {
      console.error('Persona fetch error:', personaError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Persona not found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log('V4 persona loaded for Grok:', persona.name);

    // === VOICE DIFFERENTIATION DIAGNOSTIC ===
    console.log('=== VOICE DIFFERENTIATION DIAGNOSTIC ===');
    console.log('Current persona data keys:', Object.keys(persona));
    console.log(persona.name, 'signature phrases:', persona.full_profile?.communication_style?.linguistic_signature?.signature_phrases);
    console.log(persona.name, 'forbidden expressions:', persona.full_profile?.communication_style?.linguistic_signature?.forbidden_expressions);
    console.log('Full profile exists:', !!persona.full_profile);
    console.log('Full profile communication style:', persona.full_profile?.communication_style);
    console.log('Conversation summary communication style:', persona.conversation_summary?.communication_style);
    console.log('=== END DIAGNOSTIC ===');

    // Use NEW TraitAnalysisEngine with full error exposure - NO FALLBACKS
    let relevantTraits, specificOpinion, communicationExecution;

    try {
        console.log("[TRAIT DEBUG] Starting trait analysis for:", user_message);
        
        relevantTraits = TraitAnalysisEngine.extractRelevantTraits(user_message, persona.full_profile || {});
        console.log("[TRAIT DEBUG] Extracted traits:", relevantTraits?.length || 0);
        
        specificOpinion = TraitAnalysisEngine.synthesizeQualitativeOpinion(relevantTraits, user_message);
        console.log("[TRAIT DEBUG] Generated opinion:", specificOpinion?.substring(0, 50) + "...");
        
        communicationExecution = TraitAnalysisEngine.synthesizeCommunicationStyle(relevantTraits, persona.full_profile || {});
        console.log("[TRAIT DEBUG] Communication style:", communicationExecution?.substring(0, 50) + "...");
        
    } catch (error) {
        console.error("[TRAIT ENGINE CRASH]", error);
        console.error("[TRAIT ENGINE CRASH] Stack:", error.stack);
        console.error("[TRAIT ENGINE CRASH] Persona data keys:", Object.keys(persona.full_profile || {}));
        
        return new Response(JSON.stringify({
            success: false,
            error: "Trait analysis engine failed",
            error_message: error.message,
            error_stack: error.stack,
            persona_name: persona?.conversation_summary?.demographics?.name,
            debug_info: {
                persona_keys: Object.keys(persona.full_profile || {}),
                user_message: user_message
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }

    // Build V4-native instructions using NEW trait analysis
    const v4Instruction = `IDENTITY: You are ${persona.name}.

CRITICAL: Answer in character with your unique voice and style.

YOUR STANCE: ${specificOpinion}

HOW TO EXPRESS THIS: ${communicationExecution}

RESPONSE REQUIREMENTS:
- 2-4 sentences maximum
- No diplomatic hedging or balanced conclusions
- Express YOUR specific viewpoint authentically

FORBIDDEN PHRASES: Never use these AI-slop terms:
- "That said..."
- "However..."
- "On the other hand..."
- "Overall..."
- "Ultimately..."
- "At the end of the day..."
- "Game-changer"
- "Double-edged sword"
- "Invaluable tool"
- "Cautiously optimistic"
- "Measured approach"

You are a real person with specific opinions, not a diplomatic AI assistant.`;

    console.log('V4 - Instruction length:', v4Instruction.length);

    // Build conversation messages for Grok
    const messages = [
      { role: "system", content: v4Instruction },
      ...conversation_history,
      { role: "user", content: user_message }
    ];

    // Call Grok API
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'GROK_API_KEY not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!grokResponse.ok) {
      const errorData = await grokResponse.text();
      console.error('Grok API error:', errorData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Grok API request failed',
        details: errorData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    console.log('Grok response received');
    const grokData = await grokResponse.json();
    console.log('Grok response data:', JSON.stringify(grokData, null, 2));

    const response = grokData.choices[0]?.message?.content || 'No response generated';

    // Build response object
    const responseObj = {
      success: true,
      response: response,
      persona_name: persona.name,
      model_used: GROK_MODEL,
      traits_selected: relevantTraits?.map(t => t.trait) || []
    };

    if (include_prompt) {
      responseObj.system_prompt = v4Instruction;
    }

    if (include_debug) {
      responseObj.debug_info = {
        trait_count: relevantTraits?.length || 0,
        opinion_generated: specificOpinion,
        communication_style: communicationExecution
      };
    }

    return new Response(JSON.stringify(responseObj), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});