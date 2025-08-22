import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoicepackRequest {
  persona_id: string;
  user_message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona_id, user_message, conversation_history = [] }: VoicepackRequest = await req.json();
    
    console.log(`Voicepack chat request for persona: ${persona_id}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get or compile voicepack for this persona
    const voicepackResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/voicepack-compiler`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ persona_id })
    });
    
    if (!voicepackResponse.ok) {
      throw new Error(`Failed to get voicepack: ${voicepackResponse.statusText}`);
    }
    
    const { voicepack } = await voicepackResponse.json();
    console.log(`Voicepack loaded, ${Object.keys(voicepack.lexicon.signature_tokens).length} signature tokens`);

    // Classify the turn and create plan
    const classification = classifyTurn(user_message);
    const plan = planTurn(classification, voicepack, {});
    
    console.log(`Turn classified as: ${classification.intent}, topics: ${classification.topics.join(', ')}`);

    // Build the enhanced prompt using voicepack + plan
    const systemPrompt = buildVoicepackSystemPrompt();
    const developerPrompt = serializeVoicepack(voicepack);
    const assistantPlan = serializePlan(plan);

    // Single LLM call with enhanced context
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'developer', content: developerPrompt },
          ...conversation_history,
          { role: 'user', content: user_message },
          { role: 'assistant', content: assistantPlan }
        ],
        temperature: pickTemperatureFromVoicepack(voicepack),
        top_p: 0.9,
        presence_penalty: pickPresencePenalty(voicepack),
        frequency_penalty: pickFrequencyPenalty(voicepack),
        max_tokens: pickMaxTokens(plan, voicepack)
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    let rawResponse = openaiData.choices[0].message.content;

    // Post-process the response
    const finalResponse = postProcessResponse(rawResponse, voicepack, plan);

    // Log telemetry for analysis
    logTelemetry({
      persona_id,
      voicepack_hash: hashVoicepack(voicepack),
      used_response_shape: plan.response_shape,
      banned_frame_hits: countBannedFrameHits(rawResponse, plan.banned_frames),
      must_include_satisfied: checkMustIncludeSatisfied(finalResponse, plan.must_include),
      signature_token_count: countSignatureTokens(finalResponse, voicepack.lexicon.signature_tokens),
      avg_sentence_length: calculateAvgSentenceLength(finalResponse),
      original_length: rawResponse.length,
      final_length: finalResponse.length
    });

    return new Response(JSON.stringify({
      success: true,
      response: finalResponse,
      classification,
      plan,
      telemetry: {
        voicepack_tokens: countTokens(developerPrompt),
        plan_tokens: countTokens(assistantPlan),
        signature_tokens_used: countSignatureTokens(finalResponse, voicepack.lexicon.signature_tokens)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in voicepack chat:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions (simplified implementations)

function classifyTurn(userMessage: string) {
  const input = userMessage.toLowerCase();
  
  let intent = "opinion";
  if (input.includes("advice") || input.includes("should")) intent = "advice";
  if (input.includes("story") || input.includes("tell me about")) intent = "story";
  if (input.includes("problem") || input.includes("wrong")) intent = "critique";
  
  const topics = ["general"];
  if (input.includes("money") || input.includes("financial")) topics.push("finance");
  if (input.includes("political") || input.includes("government")) topics.push("politics");
  
  return {
    intent,
    topics,
    audience: "peer",
    sensitivity: topics.includes("politics") ? "high" : "low"
  };
}

function planTurn(classification: any, voicepack: any, state: any) {
  return {
    response_shape: classification.intent,
    stance_hint: [],
    must_include: classification.topics.includes("finance") ? ["avoid sophisticated jargon"] : [],
    banned_frames: voicepack.anti_mode_collapse.forbidden_frames.slice(0, 3),
    style_deltas: {},
    brevity: "medium"
  };
}

function buildVoicepackSystemPrompt(): string {
  return `You are a sophisticated persona engine. Follow the voicepack instructions precisely to generate authentic, differentiated responses. The voicepack contains compressed personality traits and behavioral patterns that must be strictly observed.

Key requirements:
- Maintain authentic voice based on voicepack lexicon and syntax patterns
- Respect knowledge boundaries and vocabulary ceiling
- Apply stance biases to topics appropriately
- Follow response shape templates
- Avoid banned phrases and ensure required elements are present
- Never break character or mention you're following a voicepack`;
}

function serializeVoicepack(voicepack: any): string {
  return JSON.stringify({
    stance_biases: voicepack.stance_biases,
    lexicon: voicepack.lexicon,
    syntax_policy: voicepack.syntax_policy,
    style_probs: voicepack.style_probs,
    anti_mode_collapse: voicepack.anti_mode_collapse,
    memory_keys: voicepack.memory_keys
  });
}

function serializePlan(plan: any): string {
  return `Response plan: ${plan.response_shape} format. ${plan.stance_hint.join(', ')}. Must include: ${plan.must_include.join(', ')}. Avoid: ${plan.banned_frames.join(', ')}. Brevity: ${plan.brevity}.`;
}

function postProcessResponse(text: string, voicepack: any, plan: any): string {
  let processed = text;
  
  // Remove banned frames
  for (const frame of plan.banned_frames) {
    processed = processed.replace(new RegExp(frame, 'gi'), '');
  }
  
  // Inject signature token if none present
  if (voicepack.lexicon.signature_tokens.length > 0) {
    const hasSignature = voicepack.lexicon.signature_tokens.some((token: string) => 
      processed.toLowerCase().includes(token.toLowerCase())
    );
    
    if (!hasSignature) {
      const token = voicepack.lexicon.signature_tokens[0];
      processed = processed.replace('.', `. ${token}.`);
    }
  }
  
  return processed.trim();
}

function pickTemperatureFromVoicepack(voicepack: any): number {
  return voicepack.style_probs.definitive_rate > 0.5 ? 0.3 : 0.7;
}

function pickPresencePenalty(voicepack: any): number {
  return voicepack.style_probs.hedge_rate > 0.4 ? 0.2 : 0.6;
}

function pickFrequencyPenalty(voicepack: any): number {
  return 0.3;
}

function pickMaxTokens(plan: any, voicepack: any): number {
  const base = { short: 150, medium: 300, long: 500 };
  return base[plan.brevity] || 300;
}

// Telemetry functions
function logTelemetry(data: any): void {
  console.log('Voicepack telemetry:', JSON.stringify(data));
}

function hashVoicepack(voicepack: any): string {
  return JSON.stringify(voicepack).length.toString(36);
}

function countBannedFrameHits(text: string, frames: string[]): number {
  return frames.filter(frame => text.toLowerCase().includes(frame.toLowerCase())).length;
}

function checkMustIncludeSatisfied(text: string, requirements: string[]): boolean {
  return requirements.every(req => {
    if (req.includes("avoid sophisticated jargon")) {
      return !text.includes("high-yield");
    }
    return true;
  });
}

function countSignatureTokens(text: string, tokens: string[]): number {
  return tokens.filter(token => text.toLowerCase().includes(token.toLowerCase())).length;
}

function calculateAvgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalWords = text.split(/\s+/).length;
  return sentences.length > 0 ? totalWords / sentences.length : 0;
}

function countTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3); // Rough approximation
}