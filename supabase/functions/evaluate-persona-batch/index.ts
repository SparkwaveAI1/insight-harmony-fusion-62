import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchSpec {
  demographics?: {
    age?: { min?: number; max?: number };
    gender?: string[];
    marital_status?: string[];
    has_children?: boolean;
    location?: {
      country?: string;
      state_region?: string;
      city?: string;
    };
  };
  roles?: Array<{ name: string; domain?: string; hard: boolean }>;
  interests?: Array<{ tag: string; weight: number }>;
  health?: Array<{ tag: string; hard: boolean; weight?: number }>;
  behaviors?: Array<{ description: string; weight: number }>;
  occupation_keywords?: string[];
  original_query: string;
}

interface PersonaCandidate {
  persona_id: string;
  name: string;
  age_computed?: number;
  gender_computed?: string;
  country_computed?: string;
  state_region_computed?: string;
  city_computed?: string;
  occupation_computed?: string;
  marital_status_computed?: string;
  has_children_computed?: boolean;
  interest_tags?: string[];
  health_tags?: string[];
  work_role_tags?: string[];
  full_profile?: any;
  conversation_summary?: any;
}

interface EvaluationResult {
  persona_id: string;
  overall_match: number;
  demographic_match: number;
  role_match: number;
  interest_match: number;
  fails_hard_requirements: boolean;
  reason: string;
  near_match_reason?: string;
}

interface RequestBody {
  spec: SearchSpec;
  candidates: PersonaCandidate[];
  strictness?: {
    hard_match_min?: number;
    soft_match_min?: number;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      console.error('GROK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'GROK_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { spec, candidates, strictness } = body;

    if (!spec || !candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing spec or candidates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Evaluating ${candidates.length} candidates against spec`);
    console.log('Original query:', spec.original_query);

    // Cap at 60 candidates for cost control
    const cappedCandidates = candidates.slice(0, 60);

    // Build compact persona summaries for LLM
    const personaSummaries = cappedCandidates.map(p => ({
      id: p.persona_id,
      name: p.name,
      age: p.age_computed,
      gender: p.gender_computed,
      location: [p.city_computed, p.state_region_computed, p.country_computed].filter(Boolean).join(', '),
      occupation: p.occupation_computed,
      marital_status: p.marital_status_computed,
      has_children: p.has_children_computed,
      interests: p.interest_tags || [],
      health: p.health_tags || [],
      work_roles: p.work_role_tags || [],
      // Include key profile data for behavioral matching
      background: p.full_profile?.identity?.background || p.conversation_summary?.demographics?.background_description || '',
      motivations: p.full_profile?.motivation_profile?.primary_motivation_labels || [],
    }));

    // Build the evaluation prompt
    const systemPrompt = `You are a persona matching evaluator. Your job is to score how well each persona matches a research study's requirements.

SCORING RULES:
- overall_match: 0.0-1.0 representing total fit
- demographic_match: 0.0-1.0 for age, gender, location, marital status
- role_match: 0.0-1.0 for occupation and work role alignment
- interest_match: 0.0-1.0 for interests, behaviors, health conditions
- fails_hard_requirements: true if ANY hard requirement is not met

HARD REQUIREMENTS (must be met):
- Demographic criteria like age range, gender, location are HARD unless query suggests flexibility
- Specific occupation requirements are HARD
- Specific health conditions mentioned as requirements are HARD

SOFT REQUIREMENTS (contribute to score but don't disqualify):
- Interests and hobbies
- Behavioral patterns
- Personality traits

OUTPUT: Return a JSON array with one object per persona. Be strict but fair.`;

    const userPrompt = `RESEARCH QUERY: "${spec.original_query}"

PARSED REQUIREMENTS:
${JSON.stringify({
  demographics: spec.demographics,
  roles: spec.roles,
  interests: spec.interests,
  health: spec.health,
  behaviors: spec.behaviors,
  occupation_keywords: spec.occupation_keywords
}, null, 2)}

CANDIDATES TO EVALUATE:
${JSON.stringify(personaSummaries, null, 2)}

Evaluate each candidate and return a JSON array like this:
[
  {
    "persona_id": "xxx",
    "overall_match": 0.85,
    "demographic_match": 1.0,
    "role_match": 0.7,
    "interest_match": 0.9,
    "fails_hard_requirements": false,
    "reason": "Brief explanation of fit"
  }
]

Return ONLY the JSON array, no other text.`;

    console.log('Calling Grok API for batch evaluation...');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'LLM evaluation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Raw LLM response length:', content.length);

    // Parse the JSON response
    let evaluations: EvaluationResult[];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        evaluations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      console.error('Content was:', content.substring(0, 500));
      
      // Fallback: return all candidates with neutral scores
      evaluations = cappedCandidates.map(p => ({
        persona_id: p.persona_id,
        overall_match: 0.5,
        demographic_match: 0.5,
        role_match: 0.5,
        interest_match: 0.5,
        fails_hard_requirements: false,
        reason: 'Evaluation parsing failed, using neutral score'
      }));
    }

    // Sort by overall_match descending, then persona_id for stability
    evaluations.sort((a, b) => {
      if (b.overall_match !== a.overall_match) {
        return b.overall_match - a.overall_match;
      }
      return a.persona_id.localeCompare(b.persona_id);
    });

    // Apply strictness thresholds
    const hardMin = strictness?.hard_match_min ?? 0.85;
    const softMin = strictness?.soft_match_min ?? 0.70;

    const exactMatches = evaluations.filter(e => !e.fails_hard_requirements && e.overall_match >= hardMin);
    const nearMatches = evaluations.filter(e => !e.fails_hard_requirements && e.overall_match >= softMin && e.overall_match < hardMin);
    const failedHard = evaluations.filter(e => e.fails_hard_requirements);

    console.log(`Evaluation complete: ${exactMatches.length} exact, ${nearMatches.length} near, ${failedHard.length} failed hard`);

    return new Response(
      JSON.stringify({
        success: true,
        evaluations,
        summary: {
          total_evaluated: evaluations.length,
          exact_matches: exactMatches.length,
          near_matches: nearMatches.length,
          failed_hard: failedHard.length,
          best_score: evaluations[0]?.overall_match ?? 0,
        },
        thresholds: {
          hard_match_min: hardMin,
          soft_match_min: softMin,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in evaluate-persona-batch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
