
import { PersonaTemplate, InterviewSection } from "./types.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

if (!openAIApiKey) {
  throw new Error("OPENAI_API_KEY is not configured");
}

export async function generatePersonaTraits(prompt: string, template: PersonaTemplate) {
  console.log("Generating persona traits with enhanced architecture");
  
  const systemPrompt = `You are an expert AI system that creates realistic, nuanced personas based on user prompts. Your task is to generate a comprehensive persona that includes enhanced psychological traits, detailed demographics, and behavioral patterns.

CRITICAL INSTRUCTIONS:
1. ALWAYS return valid JSON that exactly matches the provided template structure
2. NEVER return undefined values or malformed objects like {"_type": "undefined", "value": "undefined"}
3. ALL trait values must be numbers between 0 and 1 (e.g., 0.7, 0.3, 0.85)
4. ALL demographic fields should have realistic string values or null if truly unknown
5. Enhanced metadata version MUST be set to 2

Template structure you MUST follow exactly: ${JSON.stringify(template, null, 2)}

Generate a persona based on this prompt: "${prompt}"

Make sure ALL trait_profile values are proper numbers between 0 and 1, and ALL metadata fields are properly filled with realistic values.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("Raw OpenAI response:", content.substring(0, 500) + "...");

    // Parse the JSON response
    let personaData;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      personaData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Content that failed to parse:", content);
      throw new Error("Failed to parse persona data from OpenAI response");
    }

    // Validate and fix trait profile structure
    if (!personaData.trait_profile || typeof personaData.trait_profile !== 'object') {
      console.warn("Invalid trait_profile structure, creating default");
      personaData.trait_profile = createDefaultTraitProfile();
    } else {
      // Ensure all trait categories exist and have proper values
      personaData.trait_profile = validateAndFixTraitProfile(personaData.trait_profile);
    }

    // Ensure metadata has proper structure
    if (!personaData.metadata || typeof personaData.metadata !== 'object') {
      personaData.metadata = {};
    }
    personaData.metadata.enhanced_metadata_version = 2;

    console.log("Generated persona with validated traits:", personaData.name);
    console.log("Trait profile sample:", JSON.stringify(personaData.trait_profile.big_five, null, 2));
    
    return personaData;
  } catch (error) {
    console.error("Error in generatePersonaTraits:", error);
    throw error;
  }
}

function createDefaultTraitProfile() {
  return {
    big_five: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    moral_foundations: {
      care: 0.5,
      fairness: 0.5,
      loyalty: 0.5,
      authority: 0.5,
      sanctity: 0.5,
      liberty: 0.5,
    },
    world_values: {
      traditional_vs_secular: 0.5,
      survival_vs_self_expression: 0.5,
      materialist_vs_postmaterialist: 0.5,
    },
    political_compass: {
      economic: 0.5,
      authoritarian_libertarian: 0.5,
      cultural_conservative_progressive: 0.5,
      political_salience: 0.5,
      group_fusion_level: 0.5,
      outgroup_threat_sensitivity: 0.5,
      commons_orientation: 0.5,
      political_motivations: {
        material_interest: 0.5,
        moral_vision: 0.5,
        cultural_preservation: 0.5,
        status_reordering: 0.5,
      },
    },
    cultural_dimensions: {
      power_distance: 0.5,
      individualism_vs_collectivism: 0.5,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.5,
      long_term_orientation: 0.5,
      indulgence_vs_restraint: 0.5,
    },
    social_identity: {
      identity_strength: 0.5,
      identity_complexity: 0.5,
      ingroup_bias_tendency: 0.5,
      outgroup_bias_tendency: 0.5,
      social_dominance_orientation: 0.5,
      system_justification: 0.5,
      intergroup_contact_comfort: 0.5,
      cultural_intelligence: 0.5,
    },
    behavioral_economics: {
      present_bias: 0.5,
      loss_aversion: 0.5,
      overconfidence: 0.5,
      risk_sensitivity: 0.5,
      scarcity_sensitivity: 0.5,
    },
    extended_traits: {
      truth_orientation: 0.5,
      moral_consistency: 0.5,
      self_awareness: 0.5,
      empathy: 0.5,
      self_efficacy: 0.5,
      manipulativeness: 0.5,
      impulse_control: 0.5,
      shadow_trait_activation: 0.5,
      attention_pattern: 0.5,
      cognitive_load_resilience: 0.5,
      institutional_trust: 0.5,
      conformity_tendency: 0.5,
      conflict_avoidance: 0.5,
      cognitive_flexibility: 0.5,
      need_for_cognitive_closure: 0.5,
      emotional_intensity: 0.5,
      emotional_regulation: 0.5,
      trigger_sensitivity: 0.5,
    },
  };
}

function validateAndFixTraitProfile(traitProfile: any) {
  const defaultProfile = createDefaultTraitProfile();
  
  // Ensure all main categories exist
  for (const category of Object.keys(defaultProfile)) {
    if (!traitProfile[category] || typeof traitProfile[category] !== 'object') {
      console.warn(`Missing or invalid trait category: ${category}, using defaults`);
      traitProfile[category] = defaultProfile[category];
    } else {
      // Validate individual traits within each category
      for (const trait of Object.keys(defaultProfile[category])) {
        if (typeof traitProfile[category][trait] !== 'number' || 
            traitProfile[category][trait] < 0 || 
            traitProfile[category][trait] > 1) {
          console.warn(`Invalid trait value for ${category}.${trait}, using default`);
          traitProfile[category][trait] = defaultProfile[category][trait];
        }
      }
    }
  }
  
  return traitProfile;
}

export async function generateInterviewResponses(persona: any): Promise<InterviewSection[] | null> {
  console.log("Generating interview responses with health and physical context");
  
  const systemPrompt = `You are conducting an in-depth interview with the persona described below. Generate realistic, detailed responses to interview questions that reflect this person's background, personality traits, and life experiences.

Persona Details:
Name: ${persona.name}
Demographics: ${JSON.stringify(persona.metadata, null, 2)}
Trait Profile: ${JSON.stringify(persona.trait_profile, null, 2)}

IMPORTANT: Respond as this specific person would, incorporating their:
- Personality traits and psychological profile
- Demographic background and life experiences  
- Health status and physical characteristics
- Cultural and social context
- Communication style and linguistic patterns

Generate responses that are authentic, detailed, and consistent with this persona's profile.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: `Please generate interview responses for the interview sections: ${JSON.stringify(persona.interview_sections, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error for interview responses: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("No interview response content received");
      return null;
    }

    // Parse the interview responses
    let interviewData;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      interviewData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse interview responses:", parseError);
      return null;
    }

    console.log("Generated interview responses with health and physical context");
    return interviewData;
  } catch (error) {
    console.error("Error generating interview responses:", error);
    return null;
  }
}
