import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// Import types and functions for voicepack runtime
interface VoicepackRuntime {
  stance_biases: Array<{ topic: string; w: number }>;
  response_shapes: Record<string, string[]>;
  lexicon: {
    signature_tokens: string[];
    discourse_markers: Array<{ term: string; p: number }>;
    interjections: Array<{ term: string; p: number }>;
  };
  syntax_policy: {
    sentence_length_dist: { short: number; medium: number; long: number };
    complexity: "simple" | "compound" | "complex";
    lists_per_200toks_max: number;
  };
  style_probs: {
    hedge_rate: number; modal_rate: number; definitive_rate: number;
    rhetorical_q_rate: number; profanity_rate: number;
  };
  register_rules: Array<{ when: Record<string,string>; shift: Record<string,string|number> }>;
  state_hooks: Record<string, Record<string, number | string>>;
  sexuality_hooks_summary: { 
    privacy: "private"|"selective"|"open"; 
    disclosure: "low"|"medium"|"high"; 
    humor_style_bias: string;
  };
  anti_mode_collapse: { 
    forbidden_frames: string[]; 
    must_include_one_of: Record<string,string[]>;
  };
  memory_keys: string[];
}

interface TurnClassification {
  intent: "opinion"|"critique"|"advice"|"story"|"compare"|"clarify";
  topics: string[];
  audience: "peer"|"authority"|"stranger"|"in-group"|"brand";
  sensitivity: "low"|"medium"|"high";
}

interface Plan {
  response_shape: string;
  stance_hint: string[];
  must_include: string[];
  banned_frames: string[];
  style_deltas: Record<string, number | string>;
  brevity: "short"|"medium"|"long";
  memory_snippets?: string[];
}

interface ConversationState {
  stress: number;
  fatigue: number;
  sexual_tension: number;
  familiarity: number;
  turn_count: number;
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for voicepack pipeline
function classifyTurn(userText: string): TurnClassification {
  const text = userText.toLowerCase();
  
  let intent: TurnClassification['intent'] = "clarify";
  if (text.includes("what do you think") || text.includes("your opinion")) intent = "opinion";
  else if (text.includes("review") || text.includes("feedback") || text.includes("critique")) intent = "critique";
  else if (text.includes("help") || text.includes("advice") || text.includes("should i")) intent = "advice";
  else if (text.includes("tell me about") || text.includes("story") || text.includes("experience")) intent = "story";
  else if (text.includes("compare") || text.includes("versus") || text.includes("better")) intent = "compare";

  const topics: string[] = [];
  if (text.includes("website") || text.includes("ui") || text.includes("design")) topics.push("website-ux");
  if (text.includes("price") || text.includes("cost") || text.includes("money")) topics.push("pricing");
  if (text.includes("safe") || text.includes("security")) topics.push("safety");
  if (topics.length === 0) topics.push("general");

  let audience: TurnClassification['audience'] = "peer";
  if (text.includes("sir") || text.includes("ma'am")) audience = "authority";
  
  let sensitivity: TurnClassification['sensitivity'] = "low";
  if (text.includes("personal") || text.includes("private")) sensitivity = "high";
  else if (text.includes("relationship") || text.includes("money")) sensitivity = "medium";

  return { intent, topics, audience, sensitivity };
}

function planTurn(cls: TurnClassification, vp: VoicepackRuntime, state: ConversationState): Plan {
  const responseShape = cls.intent;
  
  const stanceHints: string[] = [];
  for (const topic of cls.topics) {
    const bias = vp.stance_biases.find(b => b.topic === topic);
    if (bias && bias.w > 0.3) {
      stanceHints.push(`${bias.w > 0.7 ? 'Strong' : 'Moderate'} stance on ${topic}`);
    }
  }
  
  const mustInclude: string[] = [];
  if (cls.topics.includes("website-ux")) mustInclude.push("specific design element");
  if (cls.intent === "advice") mustInclude.push("actionable suggestion");
  
  const styleDeltas: Record<string, number | string> = {};
  for (const [condition, effects] of Object.entries(vp.state_hooks)) {
    const [stateVar, threshold] = condition.split('>');
    if ((state as any)[stateVar] && parseFloat((state as any)[stateVar]) > parseFloat(threshold)) {
      Object.assign(styleDeltas, effects);
    }
  }
  
  let brevity: Plan['brevity'] = "medium";
  if (cls.intent === "clarify") brevity = "short";
  if (cls.intent === "story") brevity = "long";
  
  return {
    response_shape: responseShape,
    stance_hint: stanceHints.slice(0, 2),
    must_include: mustInclude.slice(0, 2),
    banned_frames: vp.anti_mode_collapse.forbidden_frames,
    style_deltas,
    brevity,
    memory_snippets: vp.memory_keys.slice(0, 2)
  };
}

function updateStateFromText(previousState: ConversationState, userMessage: string): ConversationState {
  const text = userMessage.toLowerCase();
  const newState = { ...previousState };
  
  if (text.includes("urgent") || text.includes("emergency")) {
    newState.stress = Math.min(1.0, (newState.stress || 0) + 0.3);
  }
  newState.fatigue = Math.min(1.0, (newState.fatigue || 0) + 0.05);
  newState.turn_count += 1;
  
  return newState;
}

function postProcess(text: string, vp: VoicepackRuntime, plan: Plan): string {
  let processedText = text.trim();
  
  // Inject signature tokens if missing
  const signatures = vp.lexicon.signature_tokens;
  if (signatures.length > 0) {
    const hasSignature = signatures.some(sig => processedText.toLowerCase().includes(sig.toLowerCase()));
    if (!hasSignature) {
      const randomSignature = signatures[Math.floor(Math.random() * signatures.length)];
      processedText = `${randomSignature} ${processedText}`;
    }
  }
  
  // Remove banned frames
  for (const frame of plan.banned_frames) {
    const regex = new RegExp(frame.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processedText = processedText.replace(regex, '');
  }
  
  // Privacy guardrails
  if (vp.sexuality_hooks_summary.privacy === "private") {
    processedText = processedText.replace(/\b(sexual|intimate)\b/gi, '[private]');
  }
  
  return processedText.replace(/\s+/g, ' ').trim();
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
      mode = 'voicepack',
      conversationContext = '',
      imageData
    } = await req.json();

    console.log('Voicepack chat request:', { personaId, messageLength: message.length, mode });

    // Try to fetch PersonaV2 first, fallback to old personas
    let persona = null;
    const { data: personaV2, error: v2Error } = await supabase
      .from('personas_v2')
      .select('*')
      .eq('id', personaId)
      .single();

    if (personaV2) {
      persona = personaV2;
      console.log('Using PersonaV2 for voicepack pipeline');
    } else {
      const { data: legacyPersona, error: legacyError } = await supabase
        .from('personas')
        .select('*')
        .eq('persona_id', personaId)
        .single();
      
      if (legacyPersona) {
        persona = legacyPersona;
        console.log('Using legacy persona, compiling voicepack');
      }
    }

    if (!persona) {
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get or compile voicepack runtime
    let voicepack: VoicepackRuntime;
    if (personaV2 && personaV2.voicepack_runtime) {
      voicepack = personaV2.voicepack_runtime;
      console.log('Using cached voicepack runtime');
    } else {
      // Compile voicepack from persona data
      console.log('Compiling voicepack runtime from persona');
      const personaData = personaV2 ? personaV2.persona_data : persona;
      
      voicepack = {
        stance_biases: [
          { topic: "technology", w: 0.7 },
          { topic: "relationships", w: 0.5 },
          { topic: "general", w: 1.0 }
        ],
        response_shapes: {
          opinion: ["I think", "My view is", "From my perspective"],
          advice: ["You should", "I'd suggest", "Consider"],
          story: ["I remember", "Once", "There was a time"],
          critique: ["The issue is", "What concerns me", "The problem"],
          compare: ["Unlike", "Compared to", "The difference"],
          clarify: ["Let me explain", "To clarify", "What I mean is"]
        },
        lexicon: {
          signature_tokens: [`As a ${personaData.identity?.occupation || 'person'}`],
          discourse_markers: [{ term: "I think", p: 0.3 }],
          interjections: [{ term: "um", p: 0.1 }]
        },
        syntax_policy: {
          sentence_length_dist: { short: 0.3, medium: 0.5, long: 0.2 },
          complexity: "compound",
          lists_per_200toks_max: 2
        },
        style_probs: {
          hedge_rate: 0.3,
          modal_rate: 0.4,
          definitive_rate: 0.5,
          rhetorical_q_rate: 0.2,
          profanity_rate: 0.1
        },
        register_rules: [],
        state_hooks: { "stress>0.6": { "hedge_rate": "+0.1" } },
        sexuality_hooks_summary: {
          privacy: "selective",
          disclosure: "medium",
          humor_style_bias: "none"
        },
        anti_mode_collapse: {
          forbidden_frames: ["It's clear what this is about", "Overall pretty solid", "At the end of the day"],
          must_include_one_of: { opinion: ["perspective", "view"] }
        },
        memory_keys: ["Started current career"]
      };
    }

    // Classification and planning (single-call fast path)
    const startTime = Date.now();
    console.log('🚀 Starting voicepack single-call pipeline');
    
    const classification = classifyTurn(message);
    console.log('Turn classified:', classification);
    
    const state: ConversationState = { 
      stress: 0.3, 
      fatigue: 0.2, 
      sexual_tension: 0.1, 
      familiarity: 0.5,
      turn_count: previousMessages.length
    };
    const updatedState = updateStateFromText(state, message);
    console.log('State updated:', updatedState);
    
    const plan = planTurn(classification, voicepack, updatedState);
    console.log('Plan generated:', plan);

    // Single LLM call with voicepack + plan
    const systemPrompt = "You are a helpful AI assistant. Follow the voicepack guidelines and plan provided. Respond authentically as the persona described.";
    const developerPrompt = JSON.stringify({
      stance_biases: voicepack.stance_biases,
      response_shapes: voicepack.response_shapes,
      lexicon: voicepack.lexicon,
      style_probs: voicepack.style_probs,
      anti_mode_collapse: voicepack.anti_mode_collapse,
      memory_keys: voicepack.memory_keys
    });
    const assistantPlan = `Response Shape: ${plan.response_shape}
Stance: ${plan.stance_hint.join(', ')}
Must Include: ${plan.must_include.join(', ')}
Brevity: ${plan.brevity}
Avoid: ${plan.banned_frames.slice(0, 3).join(', ')}
Memory: ${plan.memory_snippets?.join(', ') || 'none'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'developer', content: developerPrompt },
      { role: 'user', content: message },
      { role: 'assistant', content: assistantPlan }
    ];

    // Add image support
    if (imageData) {
      messages[2] = {
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      };
    }

    const temperature = 0.7 + (updatedState.stress || 0) * 0.3;
    const maxTokens = plan.brevity === "short" ? 100 : plan.brevity === "medium" ? 200 : 350;

    console.log(`Single LLM call: temp=${temperature}, tokens=${maxTokens}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`AI service temporarily unavailable`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I cannot respond right now.';

    // Post-process the response (no second LLM call)
    aiResponse = postProcess(aiResponse, voicepack, plan);
    
    const latencyMs = Date.now() - startTime;
    console.log(`Voicepack pipeline completed in ${latencyMs}ms`);

    // Log telemetry
    console.log('Telemetry:', {
      personaId,
      response_shape: plan.response_shape,
      signature_usage: voicepack.lexicon.signature_tokens.some(sig => 
        aiResponse.toLowerCase().includes(sig.toLowerCase())
      ),
      banned_frame_hits: plan.banned_frames.filter(frame => 
        aiResponse.toLowerCase().includes(frame.toLowerCase())
      ).length,
      brevity: plan.brevity,
      latency_ms: latencyMs
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      personaId,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: classification.intent,
        topics: classification.topics,
        brevity: plan.brevity,
        latency_ms: latencyMs,
        pipeline: 'voicepack'
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