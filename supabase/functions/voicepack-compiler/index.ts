import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona_id } = await req.json();
    
    console.log(`Compiling voicepack for persona: ${persona_id}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch persona data
    const { data: persona, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single();

    if (error || !persona) {
      throw new Error(`Failed to fetch persona: ${error?.message || 'Not found'}`);
    }

    // Check if voicepack already exists and is recent
    if (persona.voicepack_runtime && 
        persona.updated_at && 
        new Date(persona.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log(`Using cached voicepack for ${persona_id}`);
      return new Response(JSON.stringify({
        success: true,
        voicepack: persona.voicepack_runtime,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Compile new voicepack
    console.log(`Compiling new voicepack for ${persona_id}`);
    const voicepack = compilePersonaToVoicepack(persona);
    
    // Cache in database
    await supabase
      .from('v4_personas')
      .update({ voicepack_runtime: voicepack })
      .eq('persona_id', persona_id);
    
    console.log(`Voicepack compiled and cached for ${persona_id}`);

    return new Response(JSON.stringify({
      success: true,
      voicepack,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error compiling voicepack:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function compilePersonaToVoicepack(persona: any) {
  const profile = persona.full_profile || {};
  const summary = persona.conversation_summary || {};
  
  // Extract stance/topic salience
  const stance_biases = extractStanceBiases(profile);
  
  // Build response shapes
  const response_shapes = buildResponseShapes(profile);
  
  // Build lexicon
  const lexicon = buildLexicon(profile);
  
  // Build syntax policy
  const syntax_policy = buildSyntaxPolicy(profile);
  
  // Build style probabilities
  const style_probs = buildStyleProbs(profile);
  
  // Build register rules
  const register_rules = buildRegisterRules(profile);
  
  // Build state hooks
  const state_hooks = buildStateHooks(profile);
  
  // Build sexuality hooks
  const sexuality_hooks_summary = buildSexualityHooks(profile);
  
  // Build anti-mode collapse
  const anti_mode_collapse = buildAntiModeCollapse(profile);
  
  // Extract memory keys
  const memory_keys = extractMemoryKeys(profile);

  return {
    stance_biases,
    response_shapes,
    lexicon,
    syntax_policy,
    style_probs,
    register_rules,
    state_hooks,
    sexuality_hooks_summary,
    anti_mode_collapse,
    memory_keys
  };
}

function extractStanceBiases(profile: any) {
  const biases = [];
  
  // Political identity
  const political = profile.identity_salience?.political_identity;
  if (political?.strength > 0.3) {
    biases.push({
      topic: "politics",
      w: political.strength * (political.orientation === "conservative" ? -0.7 : 0.7)
    });
  }
  
  // Occupation-based stances
  const occupation = profile.identity?.occupation || "";
  if (occupation.includes("nurse")) {
    biases.push({ topic: "healthcare", w: 0.8 });
  }
  if (occupation.includes("truck") || occupation.includes("driver")) {
    biases.push({ topic: "transportation", w: 0.6 });
    biases.push({ topic: "regulations", w: -0.4 });
  }
  
  return biases;
}

function buildResponseShapes(profile: any) {
  const communication = profile.communication_style?.voice_foundation || {};
  const directness = communication.directness_level || "balanced";
  
  if (directness === "blunt") {
    return {
      opinion: ["I think {stance}. {evidence}.", "Look, {stance}.", "{stance}, period."],
      critique: ["The problem is {issue}. {solution}.", "This is wrong because {reason}.", "This doesn't work."],
      advice: ["Here's what you do: {action}.", "You need to {action}.", "Simple: {action}."]
    };
  }
  
  return {
    opinion: ["I believe {stance}. {reasoning}.", "My view is {stance}.", "I think {stance}, because {evidence}."],
    critique: ["I see issues with {target}. {suggestion}.", "One concern is {issue}.", "This could be improved by {fix}."],
    advice: ["I'd suggest {action}. {reasoning}.", "Consider {action}.", "You might try {action}."]
  };
}

function buildLexicon(profile: any) {
  const communication = profile.communication_style || {};
  const signature = communication.linguistic_signature?.signature_phrases || [];
  const regional = communication.lexical_profile?.regional_markers || [];
  
  return {
    signature_tokens: [...signature.slice(0, 3), ...regional.slice(0, 2)],
    discourse_markers: [
      { term: "you know", p: 0.2 },
      { term: "I mean", p: 0.15 },
      { term: "honestly", p: 0.1 }
    ],
    interjections: [
      { term: "oh", p: 0.1 },
      { term: "well", p: 0.15 }
    ]
  };
}

function buildSyntaxPolicy(profile: any) {
  const education = profile.knowledge_profile?.education_level || "high_school";
  
  if (education === "high_school") {
    return {
      sentence_length_dist: { short: 0.6, medium: 0.3, long: 0.1 },
      complexity: "simple",
      lists_per_200toks_max: 1
    };
  }
  
  return {
    sentence_length_dist: { short: 0.3, medium: 0.5, long: 0.2 },
    complexity: "compound",
    lists_per_200toks_max: 2
  };
}

function buildStyleProbs(profile: any) {
  const communication = profile.communication_style?.voice_foundation || {};
  const directness = communication.directness_level || "balanced";
  const emotional = profile.emotional_profile?.emotional_regulation || "moderate_control";
  
  return {
    hedge_rate: directness === "diplomatic" ? 0.4 : 0.2,
    modal_rate: directness === "indirect" ? 0.3 : 0.15,
    definitive_rate: directness === "blunt" ? 0.3 : 0.1,
    rhetorical_q_rate: 0.05,
    profanity_rate: emotional === "low_control" ? 0.08 : 0.02
  };
}

function buildRegisterRules(profile: any) {
  return [
    {
      when: { audience: "authority" },
      shift: { formality: "+1", hedge_rate: "+0.2" }
    }
  ];
}

function buildStateHooks(profile: any) {
  return {
    "stress>0.6": {
      hedge_rate: "+0.1",
      sentence_length_dist: '{"short":0.7,"medium":0.2,"long":0.1}'
    }
  };
}

function buildSexualityHooks(profile: any) {
  const sexuality = profile.sexuality_profile || {};
  
  return {
    privacy: sexuality.expression_style || "selective",
    disclosure: sexuality.boundaries?.comfort_level === "conservative" ? "low" : "medium",
    humor_style_bias: sexuality.linguistic_influences?.humor_boundaries || "suggestive"
  };
}

function buildAntiModeCollapse(profile: any) {
  return {
    forbidden_frames: [
      "It's clear what this is about",
      "Overall pretty solid",
      "At the end of the day",
      "This is a complex issue",
      "There are valid points on both sides"
    ],
    must_include_one_of: {
      opinion: ["specific example", "personal experience"],
      advice: ["actionable step", "personal relevance"],
      critique: ["specific problem", "alternative suggestion"]
    }
  };
}

function extractMemoryKeys(profile: any) {
  const keys = [];
  
  const identity = profile.identity || {};
  if (identity.occupation) keys.push(`Works as ${identity.occupation}`);
  if (identity.location?.city) keys.push(`Lives in ${identity.location.city}`);
  
  const goals = profile.motivation_profile?.goal_orientation?.primary_goals || [];
  goals.slice(0, 2).forEach((goal: any) => {
    if (goal.goal) keys.push(goal.goal);
  });
  
  return keys.slice(0, 6);
}