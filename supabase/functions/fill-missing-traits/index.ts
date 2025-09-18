import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaIds = [], mode = 'preview' } = await req.json();
    console.log('Fill missing traits request:', { personaIds, mode });

    // Get personas with missing traits
    let query = supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile')
      .eq('creation_completed', true);

    if (personaIds.length > 0) {
      query = query.in('persona_id', personaIds);
    }

    const { data: personas, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching personas:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${personas?.length || 0} personas to analyze`);

    const missingTraitsAnalysis = [];
    const updates = [];

    for (const persona of personas || []) {
      const analysis = analyzeTraitCompleteness(persona);
      missingTraitsAnalysis.push({
        persona_id: persona.persona_id,
        name: persona.name,
        ...analysis
      });

      if (mode === 'execute' && analysis.missingTraits.length > 0) {
        console.log(`Filling missing traits for ${persona.name}:`, analysis.missingTraits);
        
        const filledTraits = await fillMissingTraitsWithAI(
          persona,
          analysis.missingTraits
        );

        if (filledTraits) {
          updates.push({
            persona_id: persona.persona_id,
            name: persona.name,
            filled_traits: analysis.missingTraits,
            new_profile: filledTraits
          });

          // Update the persona
          const { error: updateError } = await supabase
            .from('v4_personas')
            .update({
              full_profile: filledTraits,
              updated_at: new Date().toISOString()
            })
            .eq('persona_id', persona.persona_id);

          if (updateError) {
            console.error(`Error updating persona ${persona.persona_id}:`, updateError);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      analyzed_count: missingTraitsAnalysis.length,
      analysis: missingTraitsAnalysis,
      updates: mode === 'execute' ? updates : []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fill-missing-traits function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeTraitCompleteness(persona: any) {
  const profile = persona.full_profile;
  const missingTraits = [];

  // Required trait categories based on new structure
  const requiredTraits = [
    'identity',
    'daily_life',
    'health_profile',
    'relationships',
    'money_profile',
    'motivation_profile',
    'communication_style',
    'humor_profile',
    'truth_honesty_profile',
    'bias_profile',
    'cognitive_profile',
    'emotional_profile',
    'attitude_narrative',
    'political_narrative',
    'adoption_profile',
    'prompt_shaping',
    'sexuality_profile'
  ];

  for (const trait of requiredTraits) {
    if (trait === 'attitude_narrative' || trait === 'political_narrative') {
      // String traits
      if (!profile || !profile[trait] || typeof profile[trait] !== 'string' || profile[trait].trim() === '') {
        missingTraits.push(trait);
      }
    } else {
      // Object traits
      if (!profile || !profile[trait] || typeof profile[trait] !== 'object' || Object.keys(profile[trait] || {}).length === 0) {
        missingTraits.push(trait);
      }
    }
  }

  // Check for incomplete traits - just count missing required fields
  const incompleteTraits = [];
  
  // Check identity completeness
  if (profile?.identity) {
    const requiredIdentity = ['name', 'age', 'gender', 'occupation', 'location'];
    const missing = requiredIdentity.filter(field => {
      if (field === 'location') {
        return !profile.identity.location || !profile.identity.location.city;
      }
      return !profile.identity[field] || profile.identity[field] === '';
    });
    if (missing.length > 0) incompleteTraits.push({ category: 'identity', missing });
  }

  return {
    missingTraits,
    incompleteTraits,
    completenessScore: Math.round(((requiredTraits.length - missingTraits.length) / requiredTraits.length) * 100)
  };
}

async function fillMissingTraitsWithAI(persona: any, missingTraits: string[]) {
  const systemPrompt = `You are a psychology AI expert helping to complete personality trait profiles for fictional personas. 

Given a persona's existing profile, generate the missing trait categories with realistic, psychologically coherent values.

POPULATION DISTRIBUTION GUIDELINES (batch-level targets, not per-persona requirements):
- BMI Categories: 26% normal weight, 30% overweight, 44% obese (health_profile.bmi_category: "normal", "overweight", "obese")
- Chronic Conditions: ≥60% have ≥1 condition; 50% on medications (20% mental health, 30% physical)
- Substance Use: Smoking 12% cigarettes, 20% vaping; Alcohol: 30% abstain, 40% casual, 20% regular, 10% heavy; Marijuana: 15% regular, 20% occasional, 65% none/denial
- Diet Patterns: Breakfast 35% daily, 30% skip, 35% irregular; Diet: 40% standard, 30% mixed, 20% healthy-conscious, 10% restrictive
- Attitude Ranges (qualitative guidance): Abortion 40/40/20 pro-choice/mixed/pro-life; LGBTQ+ 70/20/10 supportive/tolerant/hostile; Immigration 30/40/30 restrictive/mixed/open
- Behavioral Contradictions: Express as realistic behaviors (e.g., "tries to eat healthy but frequently gets fast food") rather than explicit contradiction fields

IMPORTANT: Return ONLY valid JSON that can be merged with existing profile. Follow this exact structure:

{
  "identity": {
    "name": "", "age": 0, "gender": "", "pronouns": "", "ethnicity": "", "nationality": "",
    "occupation": "", "relationship_status": "", "dependents": 0,
    "education_level": "", "income_bracket": "",
    "location": { "city": "", "region": "", "country": "United States", "urbanicity": "urban" }
  },
  "daily_life": {
    "primary_activities": { "work": 0, "family_time": 0, "personal_care": 0, "personal_interests": 0, "social_interaction": 0 },
    "schedule_blocks": [ { "start": "08:00", "end": "17:00", "activity": "", "setting": "" } ],
    "time_sentiment": { "work": "", "family": "", "personal": "" },
    "screen_time_summary": "",
    "mental_preoccupations": []
  },
  "health_profile": {
    "bmi_category": "", "chronic_conditions": [], "mental_health_flags": [], "medications": [],
    "adherence_level": "", "sleep_hours": 0,
    "substance_use": { "alcohol": "", "cigarettes": "", "vaping": "", "marijuana": "" },
    "fitness_level": "", "diet_pattern": ""
  },
  "relationships": {
    "household": { "status": "", "harmony_level": "", "dependents": 0 },
    "caregiving_roles": [], "friend_network": { "size": "", "frequency": "", "anchor_contexts": [] },
    "pets": []
  },
  "money_profile": {
    "attitude_toward_money": "", "earning_context": "", "spending_style": "",
    "savings_investing_habits": { "emergency_fund_months": 0, "retirement_contributions": "", "investing_style": "" },
    "debt_posture": "", "financial_stressors": [], "money_conflicts": "", "generosity_profile": ""
  },
  "motivation_profile": {
    "primary_motivation_labels": [], "deal_breakers": [],
    "primary_drivers": { "care": 0, "family": 0, "status": 0, "mastery": 0, "meaning": 0, "novelty": 0, "security": 0, "belonging": 0, "self_interest": 0 },
    "goal_orientation": { "strength": 0, "time_horizon": "", "primary_goals": [], "goal_flexibility": 0 },
    "want_vs_should_tension": { "major_conflicts": [], "default_resolution": "" }
  },
  "communication_style": {
    "regional_register": { "region": "", "urbanicity": "urban", "dialect_hints": [] },
    "voice_foundation": { "formality": "", "directness": "", "pace_rhythm": "", "positivity": "", "empathy_level": 0, "honesty_style": "", "charisma_level": 0 },
    "style_markers": { "metaphor_domains": [], "aphorism_register": "", "storytelling_vs_bullets": 0, "humor_style": "", "code_switching_contexts": [] },
    "context_switches": { "work": { "formality": "", "directness": "" }, "home": { "formality": "", "directness": "" }, "online": { "formality": "", "directness": "" } },
    "authenticity_filters": { "avoid_registers": [], "embrace_registers": [], "personality_anchors": [] }
  },
  "humor_profile": { "frequency": "", "style": [], "boundaries": [], "targets": [], "use_cases": [] },
  "truth_honesty_profile": {
    "baseline_honesty": 0, "situational_variance": { "work": 0, "home": 0, "public": 0 },
    "typical_distortions": [], "red_lines": [], "pressure_points": [], "confession_style": ""
  },
  "bias_profile": {
    "cognitive": { "status_quo": 0, "loss_aversion": 0, "confirmation": 0, "anchoring": 0, "availability": 0, "optimism": 0, "sunk_cost": 0, "overconfidence": 0 },
    "mitigations": []
  },
  "cognitive_profile": { "verbal_fluency": 0, "abstract_reasoning": 0, "problem_solving_orientation": "", "thought_coherence": 0 },
  "emotional_profile": { "stress_responses": [], "negative_triggers": [], "positive_triggers": [], "explosive_triggers": [], "emotional_regulation": "" },
  "attitude_narrative": "String description of overall attitude and worldview",
  "political_narrative": "String description of political views and influences",
  "adoption_profile": { "buyer_power": 0, "adoption_influence": 0, "risk_tolerance": 0, "change_friction": 0, "expected_objections": [], "proof_points_needed": [] },
  "prompt_shaping": {
    "voice_foundation": { "formality": "", "directness": "", "pace_rhythm": "", "positivity": "", "empathy_level": 0 },
    "style_markers": { "metaphor_domains": [], "humor_style": "", "storytelling_vs_bullets": 0 },
    "primary_motivations": [], "deal_breakers": [],
    "honesty_vector": { "baseline": 0, "work": 0, "home": 0, "public": 0, "distortions": [] },
    "bias_vector": { "top_cognitive": [], "top_social": [], "mitigation_playbook": [] },
    "context_switches": { "work": "", "home": "", "online": "" },
    "current_focus": ""
  },
  "sexuality_profile": {
    "orientation": "heterosexual", "expression_style": "private", "relationship_norms": "monogamous",
    "boundaries": { "comfort_level": "moderate", "topics_off_limits": ["intimacy issues"] },
    "linguistic_influences": { "flirtation_style": "none", "humor_boundaries": "clean", "taboo_navigation": "navigate_carefully" }
  }
}`;

  const userPrompt = `Persona: ${persona.name}
Existing profile: ${JSON.stringify(persona.full_profile, null, 2)}

Missing trait categories: ${missingTraits.join(', ')}

Generate realistic values for the missing traits that are consistent with the existing personality profile.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedTraits = JSON.parse(data.choices[0].message.content);

    // Create clean profile by removing legacy fields and keeping only new schema fields
    const cleanProfile = cleanLegacyFields(persona.full_profile);
    
    // Merge generated traits with cleaned profile
    for (const trait of missingTraits) {
      if (generatedTraits[trait]) {
        cleanProfile[trait] = generatedTraits[trait];
      }
    }

    return cleanProfile;

  } catch (error) {
    console.error('Error generating traits with AI:', error);
    return null;
  }
}

function cleanLegacyFields(profile: any) {
  if (!profile) return {};
  
  // Define the new schema fields we want to keep
  const newSchemaFields = [
    'identity',
    'daily_life', 
    'health_profile',
    'relationships',
    'money_profile',
    'motivation_profile',
    'communication_style',
    'humor_profile',
    'truth_honesty_profile',
    'bias_profile',
    'cognitive_profile', 
    'emotional_profile',
    'attitude_narrative',
    'political_narrative',
    'adoption_profile',
    'prompt_shaping',
    'sexuality_profile'
  ];
  
  // Create new clean profile with only the new schema fields
  const cleanProfile: any = {};
  
  for (const field of newSchemaFields) {
    if (profile[field] !== undefined) {
      cleanProfile[field] = profile[field];
    }
  }
  
  return cleanProfile;
}