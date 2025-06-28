
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterTraitRequest {
  name: string;
  age: number;
  gender: string;
  social_class: string;
  region: string;
  occupation?: string;
  personality_traits?: string;
  backstory?: string;
  historical_context?: string;
  date_of_birth?: string;
  ethnicity?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const characterData: CharacterTraitRequest = await req.json();
    console.log('Generating traits for character:', characterData.name);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build comprehensive prompt for character trait analysis
    const prompt = buildCharacterTraitPrompt(characterData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in psychology, history, and personality assessment. Generate realistic personality trait profiles for historical characters based on their biographical information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const traitAnalysis = data.choices[0].message.content;

    // Parse the AI response and convert to structured trait profile
    const traitProfile = parseTraitResponse(traitAnalysis, characterData);

    console.log('Generated trait profile for', characterData.name);
    
    return new Response(JSON.stringify({ traitProfile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating character traits:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildCharacterTraitPrompt(character: CharacterTraitRequest): string {
  return `
Analyze this historical character and generate a comprehensive psychological trait profile:

**Character Information:**
- Name: ${character.name}
- Age: ${character.age}
- Gender: ${character.gender}
- Ethnicity: ${character.ethnicity || 'Not specified'}
- Social Class: ${character.social_class}
- Region: ${character.region}
- Birth Date: ${character.date_of_birth || 'Unknown'}
- Occupation: ${character.occupation || 'Unknown'}

**Background:**
${character.backstory || 'No specific backstory provided'}

**Personality Traits:**
${character.personality_traits || 'No specific traits provided'}

**Historical Context:**
${character.historical_context || 'No specific historical context provided'}

Generate trait scores (0.0 to 1.0) for this character considering:
1. Their historical time period and cultural context
2. Social class and occupation influences
3. Regional cultural values
4. Personal background and experiences
5. Gender roles and expectations of their era
6. Ethnic and cultural background influences

Provide scores in this exact JSON format:
{
  "big_five": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "moral_foundations": {
    "care": 0.0-1.0,
    "fairness": 0.0-1.0,
    "loyalty": 0.0-1.0,
    "authority": 0.0-1.0,
    "sanctity": 0.0-1.0,
    "liberty": 0.0-1.0
  },
  "world_values": {
    "traditional_vs_secular": 0.0-1.0,
    "survival_vs_self_expression": 0.0-1.0,
    "materialist_vs_postmaterialist": 0.0-1.0
  },
  "political_compass": {
    "economic": -1.0 to 1.0,
    "authoritarian_libertarian": -1.0 to 1.0,
    "cultural_conservative_progressive": -1.0 to 1.0,
    "political_salience": 0.0-1.0
  },
  "behavioral_economics": {
    "present_bias": 0.0-1.0,
    "loss_aversion": 0.0-1.0,
    "overconfidence": 0.0-1.0,
    "risk_sensitivity": 0.0-1.0,
    "scarcity_sensitivity": 0.0-1.0
  },
  "cultural_dimensions": {
    "power_distance": 0.0-1.0,
    "individualism_vs_collectivism": 0.0-1.0,
    "masculinity_vs_femininity": 0.0-1.0,
    "uncertainty_avoidance": 0.0-1.0,
    "long_term_orientation": 0.0-1.0,
    "indulgence_vs_restraint": 0.0-1.0
  }
}

Consider historical context carefully - different eras had different values, social structures, and worldviews.
For ethnicity, consider how cultural background would influence personality traits, values, and worldview within their historical context.
`;
}

function parseTraitResponse(response: string, character: CharacterTraitRequest): any {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsedTraits = JSON.parse(jsonMatch[0]);
    
    // Build complete trait profile with historical defaults
    return {
      big_five: parsedTraits.big_five || getHistoricalDefaults(character).big_five,
      moral_foundations: parsedTraits.moral_foundations || getHistoricalDefaults(character).moral_foundations,
      world_values: parsedTraits.world_values || getHistoricalDefaults(character).world_values,
      political_compass: {
        ...parsedTraits.political_compass,
        group_fusion_level: 0.6,
        outgroup_threat_sensitivity: 0.4,
        commons_orientation: 0.7,
        political_motivations: {
          material_interest: 0.5,
          moral_vision: 0.6,
          cultural_preservation: 0.7,
          status_reordering: 0.3,
        },
      },
      behavioral_economics: parsedTraits.behavioral_economics || getHistoricalDefaults(character).behavioral_economics,
      cultural_dimensions: parsedTraits.cultural_dimensions || getHistoricalDefaults(character).cultural_dimensions,
      social_identity: {
        identity_strength: 0.7,
        identity_complexity: 0.5,
        ingroup_bias_tendency: 0.6,
        outgroup_bias_tendency: 0.4,
        social_dominance_orientation: 0.3,
        system_justification: 0.6,
        intergroup_contact_comfort: 0.5,
        cultural_intelligence: 0.6,
      },
      extended_traits: {
        truth_orientation: 0.7,
        moral_consistency: 0.6,
        self_awareness: 0.5,
        empathy: 0.6,
        self_efficacy: 0.7,
        manipulativeness: 0.2,
        impulse_control: 0.6,
        shadow_trait_activation: 0.3,
        attention_pattern: 0.5,
        cognitive_load_resilience: 0.6,
        institutional_trust: 0.7,
        conformity_tendency: 0.5,
        conflict_avoidance: 0.4,
        cognitive_flexibility: 0.6,
        need_for_cognitive_closure: 0.5,
        emotional_intensity: 0.5,
        emotional_regulation: 0.6,
        trigger_sensitivity: 0.4,
      },
      dynamic_state: {
        current_stress_level: 0.3,
        emotional_stability_context: 0.6,
        motivation_orientation: 0.7,
        trust_volatility: 0.4,
        trigger_threshold: 0.5,
      },
      physical_appearance: {
        height_build: character.name ? 'average height and build' : 'average height and build',
        hair: 'brown hair',
        eye_color: 'brown eyes',
        skin_tone: 'natural complexion',
        ethnicity: character.ethnicity || 'Not specified',
      },
      physical_health: {
        disabilities: [],
        health_conditions: [],
        mobility: 'normal',
      },
    };
  } catch (error) {
    console.error('Error parsing trait response:', error);
    return getHistoricalDefaults(character);
  }
}

function getHistoricalDefaults(character: CharacterTraitRequest): any {
  // Provide historically-informed defaults based on era and region
  const isPreIndustrial = character.date_of_birth && new Date(character.date_of_birth).getFullYear() < 1800;
  
  return {
    big_five: {
      openness: isPreIndustrial ? 0.4 : 0.6,
      conscientiousness: character.social_class === 'upper class' ? 0.7 : 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4,
    },
    moral_foundations: {
      care: 0.7,
      fairness: 0.6,
      loyalty: isPreIndustrial ? 0.8 : 0.6,
      authority: isPreIndustrial ? 0.8 : 0.5,
      sanctity: isPreIndustrial ? 0.7 : 0.4,
      liberty: isPreIndustrial ? 0.3 : 0.6,
    },
    world_values: {
      traditional_vs_secular: isPreIndustrial ? 0.2 : 0.4,
      survival_vs_self_expression: isPreIndustrial ? 0.3 : 0.5,
      materialist_vs_postmaterialist: 0.5,
    },
    political_compass: {
      economic: 0.3,
      authoritarian_libertarian: isPreIndustrial ? -0.3 : 0.2,
      cultural_conservative_progressive: isPreIndustrial ? -0.5 : 0.4,
      political_salience: 0.5,
    },
    behavioral_economics: {
      present_bias: 0.4,
      loss_aversion: 0.6,
      overconfidence: 0.5,
      risk_sensitivity: 0.6,
      scarcity_sensitivity: isPreIndustrial ? 0.8 : 0.6,
    },
    cultural_dimensions: {
      power_distance: isPreIndustrial ? 0.8 : 0.6,
      individualism_vs_collectivism: isPreIndustrial ? 0.3 : 0.5,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.6,
      long_term_orientation: 0.7,
      indulgence_vs_restraint: 0.4,
    },
  };
}
