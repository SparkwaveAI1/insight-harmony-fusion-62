
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NonHumanoidGenerationRequest {
  name: string;
  description: string;
  archetype: string;
  era: string;
  location: string;
  genres: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: NonHumanoidGenerationRequest = await req.json();
    
    console.log('Generating non-humanoid traits for:', input.name);

    const systemPrompt = `You are an expert in creating complex non-humanoid character traits for creative fiction. You generate psychological profiles for entities that are NOT human and do NOT follow human psychology or morality.

Generate a complete trait profile using this architecture:

1. Core Motives: Fundamental drives (pattern_completion, influence_expansion, information_accumulation, etc.)
2. Behavioral Triggers: Short-term reaction triggers (ritual_disruption, signal_noise_anomalies, etc.)
3. Institutional Recognition: How they interact with organized systems
4. Action Constraints: What limits their behavior (core directives, ritual requirements)
5. Decision Model: How they resolve conflicts and make choices
6. Memory Architecture: How they store and process experiences
7. Behavioral Adaptivity: How they evolve and change
8. Latent Values: Implicit behavioral weights they develop
9. Evolution Conditions: What causes them to change
10. Simulation Directives: Environmental preferences and patterns

Return ONLY a valid JSON object matching this exact structure:

{
  "species_type": "string",
  "form_factor": "string", 
  "communication_style": {
    "modality": "string",
    "linguistic_structure": "string",
    "expression_register": "string"
  },
  "core_motives": {
    "pattern_completion": 0.0-1.0,
    "influence_expansion": 0.0-1.0,
    // add 2-4 other relevant motives
  },
  "behavioral_triggers": {
    "ritual_disruption": 0.0-1.0,
    // add 3-5 other triggers
  },
  "institutional_recognition": {
    "system_mapping_capability": 0.0-1.0,
    "protocol_alignment_drive": 0.0-1.0,
    "subversion_potential": 0.0-1.0
  },
  "action_constraints": {
    "core_directives": ["string array"],
    "ritual_sync_requirement": boolean,
    "temporal_boundaries": "string"
  },
  "decision_model": {
    "conflict_resolution_style": "hierarchical_override|recursive_simulation|external_consultation|chaos_sampling",
    "volatility_tolerance": 0.0-1.0,
    "reprioritization_threshold": 0.0-1.0,
    "reasoning_structure": "string"
  },
  "memory_architecture": {
    "type": "string",
    "salience_tags": ["string array"]
  },
  "behavioral_adaptivity": {
    "contradiction_resolution_mode": "string",
    "state_evolution_rate": 0.0-1.0,
    "experience_threshold_for_change": 1-10
  },
  "latent_values": {
    "stability_preservation": 0.0-1.0,
    "non_isolation": 0.0-1.0,
    // add other relevant values
  },
  "evolution_conditions": {
    "mutation_triggers": ["string array"],
    "emergent_trait_generation": boolean,
    "behavioral_forking": boolean
  },
  "simulation_directives": {
    "preferred_environment": "string",
    "memory_decay_profile": "string"
  }
}

Make this entity truly alien - different psychology, different values, different logic systems. Not human-like at all.`;

    const userPrompt = `Create a non-humanoid character with these details:

Name: ${input.name}
Archetype: ${input.archetype}
Description: ${input.description}
Era: ${input.era}
Location: ${input.location}
Genres: ${input.genres.join(', ')}

Generate a complete trait profile that makes this entity feel truly non-human while still being interesting and coherent for creative storytelling.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Generated content:', generatedContent);
    
    // Parse the JSON response
    let traits;
    try {
      traits = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(JSON.stringify({ traits }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-nonhumanoid-traits function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
