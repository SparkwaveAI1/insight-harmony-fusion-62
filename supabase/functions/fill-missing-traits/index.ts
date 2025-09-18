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

  // Required trait categories
  const requiredTraits = [
    'big_five',
    'moral_foundations', 
    'behavioral_economics',
    'cultural_dimensions',
    'social_identity',
    'bias_profile'
  ];

  for (const trait of requiredTraits) {
    if (!profile || !profile[trait] || Object.keys(profile[trait] || {}).length === 0) {
      missingTraits.push(trait);
    }
  }

  // Check for incomplete traits
  const incompleteTraits = [];
  
  if (profile?.big_five) {
    const requiredBigFive = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const missing = requiredBigFive.filter(trait => !profile.big_five[trait]);
    if (missing.length > 0) incompleteTraits.push({ category: 'big_five', missing });
  }

  if (profile?.moral_foundations) {
    const requiredMoral = ['care', 'fairness', 'loyalty', 'authority', 'sanctity', 'liberty'];
    const missing = requiredMoral.filter(trait => !profile.moral_foundations[trait]);
    if (missing.length > 0) incompleteTraits.push({ category: 'moral_foundations', missing });
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

IMPORTANT: Return ONLY valid JSON that can be merged with existing profile. Use numeric values between 0-1 for all traits.

Required format for each trait category:

big_five: { openness: 0.7, conscientiousness: 0.6, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.3 }
moral_foundations: { care: 0.8, fairness: 0.7, loyalty: 0.6, authority: 0.4, sanctity: 0.3, liberty: 0.9 }
behavioral_economics: { risk_tolerance: 0.6, loss_aversion: 0.7, present_bias: 0.4, overconfidence: 0.5 }
cultural_dimensions: { individualism: 0.8, power_distance: 0.3, uncertainty_avoidance: 0.5, masculinity: 0.6 }
social_identity: { group_identification: 0.6, social_dominance: 0.4, system_justification: 0.5 }
bias_profile: { cognitive: { confirmation_bias: 0.6, availability_heuristic: 0.5, anchoring: 0.4 } }`;

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

    // Merge with existing profile
    const updatedProfile = { ...persona.full_profile };
    
    for (const trait of missingTraits) {
      if (generatedTraits[trait]) {
        updatedProfile[trait] = generatedTraits[trait];
      }
    }

    return updatedProfile;

  } catch (error) {
    console.error('Error generating traits with AI:', error);
    return null;
  }
}