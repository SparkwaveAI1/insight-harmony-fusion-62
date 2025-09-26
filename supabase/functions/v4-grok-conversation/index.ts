import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

// Flags (default OFF)
const CE_PROMPT_V2 = Deno.env.get("CE_PROMPT_V2") === "true";
const CE_OPENING_DEDUPE_RETRY = Deno.env.get("CE_OPENING_DEDUPE_RETRY") === "true";
const GROK_MODEL = Deno.env.get("GROK_MODEL") ?? "grok-4-latest";

// Log configuration at boot
console.log(`Grok model: ${GROK_MODEL}, CE_PROMPT_V2=${CE_PROMPT_V2}`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===============================
// CLEAN TRAIT-DRIVEN ARCHITECTURE
// ===============================

// 1. Extract only traits relevant to the specific question
function extractRelevantTraits(userQuestion, fullProfile) {
  const question = userQuestion.toLowerCase();
  const relevantTraits = [];
  
  // Always include thought_coherence first
  const thoughtCoherence = getNestedValue(fullProfile, 'cognitive_profile.thought_coherence');
  if (thoughtCoherence !== null) {
    relevantTraits.push({
      trait: 'thought_coherence',
      value: thoughtCoherence,
      relevance: `Affects how you organize and express complex thoughts about ${extractTopicFromQuestion(question)}`
    });
  }
  
  // For AI/technology questions
  if (question.includes('ai') || question.includes('technology') || question.includes('automation')) {
    addIfExists(relevantTraits, fullProfile, 'adoption_profile.risk_tolerance', 'Controls your comfort with new technology adoption');
    addIfExists(relevantTraits, fullProfile, 'adoption_profile.change_friction', 'Influences resistance to technological change');
    addIfExists(relevantTraits, fullProfile, 'bias_profile.cognitive.loss_aversion', 'Affects concern about what might be lost with AI adoption');
  }
  
  // For work/professional questions
  if (question.includes('work') || question.includes('professional') || question.includes('job')) {
    addIfExists(relevantTraits, fullProfile, 'daily_life.time_sentiment.work', 'Shapes your attitude toward work-related changes');
    addIfExists(relevantTraits, fullProfile, 'emotional_profile.stress_responses', 'Influences reaction to workplace pressure');
  }
  
  // For opinion/values questions
  if (question.includes('think') || question.includes('opinion') || question.includes('believe')) {
    addIfExists(relevantTraits, fullProfile, 'truth_honesty_profile.baseline_honesty', 'Determines how directly you express your true views');
    addIfExists(relevantTraits, fullProfile, 'motivation_profile.primary_drivers.meaning', 'Drives focus on deeper significance');
  }
  
  // Always include communication directness
  addIfExists(relevantTraits, fullProfile, 'communication_style.voice_foundation.directness', 'Controls how bluntly you express opinions');
  
  return relevantTraits.slice(0, 5); // Max 5 relevant traits
}

// 2. Synthesize qualitative opinion based on relevant traits
function synthesizeQualitativeOpinion(relevantTraits, userQuestion, demographics) {
  const topic = extractTopicFromQuestion(userQuestion.toLowerCase());
  const traitValues = {};
  
  // Extract trait values for analysis
  relevantTraits.forEach(trait => {
    traitValues[trait.trait] = trait.value;
  });
  
  let opinion = `Based on your traits, you think ${topic} `;
  
  // High change friction + low risk tolerance = resistance
  if (traitValues.change_friction > 0.7 && traitValues.risk_tolerance < 0.4) {
    opinion += "requires extensive validation before any adoption - you need proof it won't disrupt established workflows";
  }
  // High loss aversion = focus on what could go wrong
  else if (traitValues.loss_aversion > 0.7) {
    opinion += "poses significant risks that outweigh potential benefits - you focus on what could be lost or go wrong";
  }
  // High meaning driver = ethical concerns
  else if (traitValues.meaning > 0.7) {
    opinion += "raises important ethical questions about human value and purpose that need addressing";
  }
  // Professional director perspective
  else if (demographics.occupation?.toLowerCase().includes('director')) {
    opinion += "needs careful implementation planning with staff training and operational impact assessment";
  }
  // Default based on moderate traits
  else {
    opinion += "has potential but needs careful evaluation of practical implementation challenges";
  }
  
  return opinion;
}

// 3. Synthesize communication style qualitatively
function synthesizeCommunicationStyle(relevantTraits, demographics) {
  const traitValues = {};
  relevantTraits.forEach(trait => {
    traitValues[trait.trait] = trait.value;
  });
  
  let style = "Express this ";
  
  // Thought coherence affects structure
  if (traitValues.thought_coherence >= 0.8) {
    style += "with methodical analysis - present your main concern, supporting evidence, then practical implications. ";
  } else if (traitValues.thought_coherence <= 0.5) {
    style += "as thoughts come to you - start with gut reaction, then add details as they occur to you. ";
  } else {
    style += "by stating your main point clearly, then elaborating with supporting observations. ";
  }
  
  // Directness affects delivery
  if (traitValues.directness === 'high' || traitValues.baseline_honesty > 0.8) {
    style += "Be direct and straightforward - state your position without diplomatic hedging. ";
  } else {
    style += "Be clear but professionally measured in your delivery. ";
  }
  
  // Professional context
  if (demographics.occupation?.toLowerCase().includes('director')) {
    style += "Speak from your leadership perspective - reference operational concerns and organizational impact. ";
  } else if (demographics.occupation?.toLowerCase().includes('medical') || demographics.occupation?.toLowerCase().includes('radiology')) {
    style += "Use precise professional language reflecting your clinical experience and evidence-based thinking. ";
  }
  
  // Stress/emotional factors
  if (traitValues.stress_responses || traitValues.work === 'stressful') {
    style += "Your response reflects the workplace pressures you experience in healthcare administration.";
  }
  
  return style;
}

// Helper functions
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function addIfExists(traits, profile, path, relevance) {
  const value = getNestedValue(profile, path);
  if (value !== null && value !== undefined && value !== '') {
    traits.push({
      trait: path.split('.').pop(),
      value: value,
      relevance: relevance
    });
  }
}

function extractTopicFromQuestion(question) {
  if (question.includes('ai') || question.includes('artificial intelligence')) return 'AI in healthcare';
  if (question.includes('technology')) return 'this technology';
  if (question.includes('work') || question.includes('job')) return 'this work situation';
  return 'this topic';
}

// Clean instruction builder using the three simple functions
function buildCleanInstructions(relevantTraits, demographics, userQuestion) {
  // 1. Simple Identity Statement
  const identity = `You are ${demographics.name}, a ${demographics.age}-year-old ${demographics.occupation} living in ${demographics.location}`;
  
  // 2. Qualitative Opinion Synthesis
  const opinion = synthesizeQualitativeOpinion(relevantTraits, userQuestion, demographics);
  
  // 3. Qualitative Communication Style
  const communicationStyle = synthesizeCommunicationStyle(relevantTraits, demographics);
  
  // Forbidden phrases
  const forbiddenPhrases = [
    "That said...", "However...", "On the other hand...",
    "Overall...", "Ultimately...", "At the end of the day...",
    "Game-changer", "Double-edged sword", "Invaluable tool",
    "Cautiously optimistic", "Measured approach"
  ];
  
  const instructions = `IDENTITY: ${identity}

CRITICAL: Answer in character with your unique voice and style.

YOUR STANCE: ${opinion}

HOW TO EXPRESS THIS: ${communicationStyle}

RESPONSE REQUIREMENTS:
- 2-4 sentences maximum
- No diplomatic hedging or balanced conclusions
- Express YOUR specific viewpoint authentically

FORBIDDEN PHRASES: Never use these AI-slop terms:
${forbiddenPhrases.map(phrase => `- "${phrase}"`).join('\n')}

You are a real person with specific opinions, not a diplomatic AI assistant.`;
  
  return instructions;
}

// Extract demographics from V4 profile
function extractDemographics(conversationSummary, fullProfile) {
  const demo = conversationSummary?.demographics || {};
  const identity = fullProfile?.identity || {};
  
  return {
    name: demo.name || identity.name || "Unknown",
    age: demo.age || identity.age || "unknown age", 
    occupation: demo.occupation || identity.occupation || "unknown occupation",
    location: demo.location || identity.location?.city || identity.location || "unknown location"
  };
}

serve(async (req) => {
  console.log(`[DEBUG] v4-grok-conversation called at ${new Date().toISOString()}`);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log(`[DEBUG] Request body:`, JSON.stringify(body, null, 2));
    const { persona_id, user_message, conversation_history, include_prompt } = body

    if (!persona_id || !user_message) {
      throw new Error('Missing required fields: persona_id and user_message')
    }

    console.log(`📩 V4 Grok request for persona: ${persona_id}`)
    console.log(`📝 User message: ${user_message}`)
    console.log("🔧 VERIFICATION: Parameters received correctly - using v4-grok-conversation")

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the persona by persona_id  
    const { data: personas, error: personaError } = await supabase
      .from('v4_personas')
      .select(`
        persona_id,
        conversation_summary,
        full_profile
      `)
      .eq('persona_id', persona_id)
      .single()

    if (personaError) {
      console.error('Database error fetching persona:', personaError)
      throw new Error(`Failed to fetch persona: ${personaError.message}`)
    }

    if (!personas) {
      throw new Error(`Persona with persona_id ${persona_id} not found`)
    }

    const persona = personas;
    console.log(`✅ Found persona: ${persona.conversation_summary?.demographics?.name || persona_id}`)

    // CLEAN ARCHITECTURE: Use the three simple functions
    const demographics = extractDemographics(persona.conversation_summary, persona.full_profile);
    const relevantTraits = extractRelevantTraits(user_message, persona.full_profile);
    const instructions = buildCleanInstructions(relevantTraits, demographics, user_message);
    
    console.log('Clean - Instruction length:', instructions.length)
    console.log(`🎯 Relevant traits selected:`, relevantTraits.map(t => t.trait).join(', '))
    console.log("🧪 PROMPT_VERSION=clean-v1 | First 200 chars:", instructions.substring(0, 200))
    
    // Debug flag: return prompt if requested
    if (include_prompt) {
      return new Response(
        JSON.stringify({
          success: true,
          response: 'Debug mode: Prompt returned',
          traits_selected: relevantTraits.map(t => t.trait),
          persona_name: demographics.name,
          model_used: 'grok-debug',
          prompt_debug: { instructions }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Call Grok API with clean instructions
    const messages = [
      {
        role: 'system',
        content: instructions
      },
      // Add conversation history if provided
      ...(conversation_history || []),
      {
        role: 'user',
        content: user_message
      }
    ];

    const grokApiKey = Deno.env.get('GROK_API_KEY');
    
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: messages,
        stream: false,
        temperature: 0.7
      })
    });

    console.log('Grok response received')
    
    // Check if response is ok
    if (!grokResponse.ok) {
      const errorText = await grokResponse.text()
      console.error('Grok API error:', grokResponse.status, errorText)
      throw new Error(`Grok API error: ${grokResponse.status} - ${errorText}`)
    }

    const grokData = await grokResponse.json();
    console.log('Grok response data:', JSON.stringify(grokData, null, 2))

    // Validate response structure
    if (!grokData.choices || !Array.isArray(grokData.choices) || grokData.choices.length === 0) {
      console.error('Invalid Grok response structure:', grokData)
      throw new Error('Invalid response structure from Grok API - no choices array')
    }

    if (!grokData.choices[0].message || !grokData.choices[0].message.content) {
      console.error('Invalid Grok choice structure:', grokData.choices[0])
      throw new Error('Invalid response structure from Grok API - no message content')
    }

    const personaResponse = grokData.choices[0].message.content

    return new Response(
      JSON.stringify({ 
        success: true,
        response: personaResponse,
        traits_selected: relevantTraits.map(t => t.trait),
        traits_scores: relevantTraits.map(t => ({ trait: t.trait, score: t.relevance })),
        persona_name: demographics.name,
        model_used: 'grok-4-latest',
        prompt_debug: include_prompt ? { instructions: instructions } : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-grok-conversation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})