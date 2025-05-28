
import { PersonaTemplate } from "./types.ts";
import { generateEmotionalTriggers } from "./emotionalTriggerGenerator.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

// Generate the initial persona traits with enhanced trait architecture
export async function generatePersonaTraits(prompt: string, personaTemplate: PersonaTemplate): Promise<any> {
  console.log("Generating persona traits from prompt:", prompt);
  
  // Check if the prompt contains customization instructions and extract them
  const hasCustomizationInstructions = prompt.includes("IMPORTANT CUSTOMIZATION INSTRUCTIONS:");
  let customizationContent = "";
  
  if (hasCustomizationInstructions) {
    // Extract the customization instructions for special emphasis to the AI
    const customizationMatch = prompt.match(/IMPORTANT CUSTOMIZATION INSTRUCTIONS:\s*([\s\S]+?)(?=\n\nPlease create|$)/);
    if (customizationMatch && customizationMatch[1]) {
      customizationContent = customizationMatch[1].trim();
      console.log("Detected customization instructions:", customizationContent);
    }
  }
  
  // Create system instructions with emphasis on customizations if present
  let systemInstruction = `You are an AI specialized in creating realistic personas for research. 
    Given a brief description, generate a detailed psychological and demographic profile following the template exactly.
    
    Pay special attention to the comprehensive trait architecture:
    1. Base Traits (OCEAN, Moral Foundations, Enhanced World Values, Enhanced Political Compass, Behavioral Economics)
    2. Cultural Dimensions (Hofstede's Framework)
    3. Social Identity and Group Dynamics
    4. Extended Traits (truth orientation, moral consistency, self-awareness, etc.)
    5. Dynamic State Modifiers (stress level, emotional stability context, etc.)
    
    CULTURAL DIMENSIONS GUIDELINES - CRITICAL IMPLEMENTATION:
    - Power Distance (0-1): 0=egalitarian (low power distance), 1=hierarchical (high power distance)
    - Individualism vs Collectivism (0-1): 0=collectivist (group harmony), 1=individualist (personal achievement)
    - Masculinity vs Femininity (0-1): 0=feminine (cooperation, quality of life), 1=masculine (competition, achievement)
    - Uncertainty Avoidance (0-1): 0=comfortable with ambiguity, 1=prefers structure and rules
    - Long-term Orientation (0-1): 0=short-term (tradition, immediate results), 1=long-term (future planning, persistence)
    - Indulgence vs Restraint (0-1): 0=restraint (strict social norms), 1=indulgence (free expression of desires)
    
    SOCIAL IDENTITY GUIDELINES - CRITICAL IMPLEMENTATION:
    - Identity Strength (0-1): How strongly they identify with social groups
    - Identity Complexity (0-1): Diversity and number of social identities they hold
    - Ingroup Bias Tendency (0-1): Favoritism toward their own groups
    - Outgroup Bias Tendency (0-1): Prejudice or suspicion toward other groups
    - Social Dominance Orientation (0-1): Support for group-based hierarchies
    - System Justification (0-1): Tendency to defend and rationalize the status quo
    - Intergroup Contact Comfort (0-1): Ease and comfort when interacting with diverse groups
    - Cultural Intelligence (0-1): Ability to function effectively in culturally diverse settings
    
    ENHANCED POLITICAL COMPASS GUIDELINES - CRITICAL IMPLEMENTATION:
    - Political Salience (0-100): How central politics is to identity. Higher = more emotional reactivity to political topics
    - Group Fusion Level (0-1): Identity fusion with political group. Higher = extreme loyalty, self-sacrifice for group
    - Outgroup Threat Sensitivity (0-1): How threatening opposing political views feel. Ties to worldview danger/safety
    - Commons Orientation (0-1): Views on shared responsibility and public goods
    - Cultural Conservative Progressive (0-1): Separate from economic axis - cultural values and social change
    - Political Motivations: Rate each 0-1:
      * Material Interest: Economic benefit/harm focus
      * Moral Vision: Justice/fairness focus  
      * Cultural Preservation: Heritage/tradition focus
      * Status Reordering: Desire to change/maintain hierarchies
    
    ENHANCED WORLD VALUES GUIDELINES - CRITICAL IMPLEMENTATION:
    - Traditional vs Secular (0-1): 0=traditional/religious, 1=secular/rational
    - Survival vs Self-Expression (0-1): 0=survival/security focus, 1=self-expression/quality of life
    - Materialist vs Post-Materialist (0-1): 0=economic security priority, 1=self-actualization priority
    
    MANDATORY: ALL ENHANCED TRAITS MUST BE POPULATED. Do not leave any of the new cultural dimensions, social identity, political compass, or world values fields as null.
    
    IMPORTANT DIVERSITY GUIDELINES:
    - AVOID DEFAULT TRAITS: Do not use "coffee drinker" or other generic habits as default traits
    - CREATE UNIQUE ROUTINES: Each persona should have distinct daily patterns based on their specific background
    - VARY MORNING RITUALS: Some may drink coffee, others tea, water, nothing, protein shakes, etc.
    - DIVERSE PREFERENCES: Deliberately vary food preferences, media consumption, and daily habits
    - CULTURAL SPECIFICITY: Align habits with the persona's cultural background and region
    - SOCIOECONOMIC REALISM: Consider how income level would affect daily routines and consumption
    
    Fill in all demographic fields and knowledge domains in the metadata section.
    For each knowledge domain, assign a value from 1 (minimal) to 5 (expert).
    
    For trait values, use decimal values between 0 and 1 (like 0.7) for all numerical traits.
    Ensure internal consistency while allowing for realistic contradictions.
    
    Cultural dimensions should reflect the persona's cultural background and personal experiences.
    Social identity traits should be consistent with their demographic profile and life experiences.
    Political traits should reflect realistic combinations - someone with high political salience 
    and group fusion will show more extreme views and emotional reactivity.
    
    Return the output as valid JSON matching the provided template exactly.`;

  // If customization instructions are present, add them to the system instructions
  if (customizationContent) {
    systemInstruction += `\n\nCRITICAL CUSTOMIZATION REQUIRED: These customizations must be deeply integrated into the persona's traits and personality:
    ${customizationContent}
    
    The customization instructions should significantly influence ALL aspects of the persona, including their trait values, preferences, behaviors, and knowledge domains.`;
  }
  
  const traitsResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemInstruction
        },
        { 
          role: "user", 
          content: `Create a realistic persona based on this description: "${
            // Clean up the prompt if it contains the customization markers
            hasCustomizationInstructions ? 
              prompt.replace(/IMPORTANT CUSTOMIZATION INSTRUCTIONS:[\s\S]+?(?=\n\nPlease create|$)/, "").trim() : 
              prompt
          }".
          Fill in all the values according to the template structure below. Return ONLY the JSON data, no markdown formatting.
          ${JSON.stringify(personaTemplate, null, 2)}` 
        }
      ],
      temperature: 0.9, // Increased from 0.7 to encourage more diversity
    }),
  });

  if (!traitsResponse.ok) {
    const errorData = await traitsResponse.text();
    console.error("OpenAI API error:", errorData);
    throw new Error(`OpenAI API error: ${traitsResponse.status}`);
  }

  const traitsData = await traitsResponse.json();
  
  if (!traitsData.choices || !traitsData.choices[0] || !traitsData.choices[0].message) {
    console.error("Invalid response from OpenAI:", traitsData);
    throw new Error("Invalid response from OpenAI");
  }
  
  let personaTraits;
  try {
    const content = traitsData.choices[0].message.content;
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    personaTraits = JSON.parse(jsonContent);
    console.log("Successfully parsed persona traits");
    
    // ENHANCED LOGGING: Log the new trait structures
    console.log("=== ENHANCED TRAIT VERIFICATION ===");
    
    // Check World Values
    if (personaTraits.trait_profile?.world_values) {
      console.log("World Values traits:", JSON.stringify(personaTraits.trait_profile.world_values, null, 2));
      const worldValues = personaTraits.trait_profile.world_values;
      console.log("- Traditional vs Secular:", worldValues.traditional_vs_secular);
      console.log("- Survival vs Self-Expression:", worldValues.survival_vs_self_expression);
      console.log("- Materialist vs Post-Materialist:", worldValues.materialist_vs_postmaterialist);
    } else {
      console.error("WARNING: World Values traits missing!");
    }
    
    // Check Political Compass
    if (personaTraits.trait_profile?.political_compass) {
      console.log("Political Compass traits:", JSON.stringify(personaTraits.trait_profile.political_compass, null, 2));
      const politicalCompass = personaTraits.trait_profile.political_compass;
      console.log("- Political Salience:", politicalCompass.political_salience);
      console.log("- Group Fusion Level:", politicalCompass.group_fusion_level);
      console.log("- Outgroup Threat Sensitivity:", politicalCompass.outgroup_threat_sensitivity);
      console.log("- Commons Orientation:", politicalCompass.commons_orientation);
      console.log("- Cultural Conservative Progressive:", politicalCompass.cultural_conservative_progressive);
      
      if (politicalCompass.political_motivations) {
        console.log("Political Motivations:", JSON.stringify(politicalCompass.political_motivations, null, 2));
        console.log("  - Material Interest:", politicalCompass.political_motivations.material_interest);
        console.log("  - Moral Vision:", politicalCompass.political_motivations.moral_vision);
        console.log("  - Cultural Preservation:", politicalCompass.political_motivations.cultural_preservation);
        console.log("  - Status Reordering:", politicalCompass.political_motivations.status_reordering);
      } else {
        console.error("WARNING: Political Motivations missing!");
      }
    } else {
      console.error("WARNING: Political Compass traits missing!");
    }
    
    // Check Cultural Dimensions (NEW)
    if (personaTraits.trait_profile?.cultural_dimensions) {
      console.log("Cultural Dimensions traits:", JSON.stringify(personaTraits.trait_profile.cultural_dimensions, null, 2));
      const culturalDimensions = personaTraits.trait_profile.cultural_dimensions;
      console.log("- Power Distance:", culturalDimensions.power_distance);
      console.log("- Individualism vs Collectivism:", culturalDimensions.individualism_vs_collectivism);
      console.log("- Masculinity vs Femininity:", culturalDimensions.masculinity_vs_femininity);
      console.log("- Uncertainty Avoidance:", culturalDimensions.uncertainty_avoidance);
      console.log("- Long-term Orientation:", culturalDimensions.long_term_orientation);
      console.log("- Indulgence vs Restraint:", culturalDimensions.indulgence_vs_restraint);
    } else {
      console.error("WARNING: Cultural Dimensions traits missing!");
    }
    
    // Check Social Identity (NEW)
    if (personaTraits.trait_profile?.social_identity) {
      console.log("Social Identity traits:", JSON.stringify(personaTraits.trait_profile.social_identity, null, 2));
      const socialIdentity = personaTraits.trait_profile.social_identity;
      console.log("- Identity Strength:", socialIdentity.identity_strength);
      console.log("- Identity Complexity:", socialIdentity.identity_complexity);
      console.log("- Ingroup Bias Tendency:", socialIdentity.ingroup_bias_tendency);
      console.log("- Outgroup Bias Tendency:", socialIdentity.outgroup_bias_tendency);
      console.log("- Social Dominance Orientation:", socialIdentity.social_dominance_orientation);
      console.log("- System Justification:", socialIdentity.system_justification);
      console.log("- Intergroup Contact Comfort:", socialIdentity.intergroup_contact_comfort);
      console.log("- Cultural Intelligence:", socialIdentity.cultural_intelligence);
    } else {
      console.error("WARNING: Social Identity traits missing!");
    }
    
    // Verify all required enhanced traits are present
    const missingTraits = [];
    if (!personaTraits.trait_profile?.world_values?.materialist_vs_postmaterialist) {
      missingTraits.push("world_values.materialist_vs_postmaterialist");
    }
    if (!personaTraits.trait_profile?.political_compass?.political_salience) {
      missingTraits.push("political_compass.political_salience");
    }
    if (!personaTraits.trait_profile?.cultural_dimensions?.power_distance) {
      missingTraits.push("cultural_dimensions.power_distance");
    }
    if (!personaTraits.trait_profile?.social_identity?.identity_strength) {
      missingTraits.push("social_identity.identity_strength");
    }
    
    if (missingTraits.length > 0) {
      console.error("MISSING ENHANCED TRAITS:", missingTraits);
    } else {
      console.log("✅ All enhanced traits successfully generated!");
    }
    
    console.log("=== END TRAIT VERIFICATION ===");
    
    // Generate emotional triggers based on the persona traits and original prompt
    console.log("Generating emotional triggers...");
    const emotionalTriggers = generateEmotionalTriggers(personaTraits, prompt);
    personaTraits.emotional_triggers = emotionalTriggers;
    console.log("Generated emotional triggers:", emotionalTriggers);
    
    // If customization was requested, store it in the persona metadata
    if (customizationContent && personaTraits.metadata) {
      personaTraits.metadata.customization_instructions = customizationContent;
      personaTraits.metadata.was_customized = true;
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw content:", traitsData.choices[0].message.content);
    throw new Error("Failed to parse persona data from OpenAI response");
  }

  return personaTraits;
}

// Generate interview responses based on the persona
export async function generateInterviewResponses(personaTraits: any): Promise<any> {
  console.log("Generating interview responses for persona");
  
  const interviewResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an AI that simulates interviews for realistic personas. 
          Given a persona definition with a comprehensive trait architecture including:
          1. Base Traits (OCEAN, Moral Foundations, World Values, Political Compass, Behavioral Economics)
          2. Cultural Dimensions (Hofstede's Framework)
          3. Social Identity and Group Dynamics
          4. Extended Traits (truth orientation, moral consistency, self-awareness, etc.)
          5. Dynamic State Modifiers (stress level, emotional stability context, etc.)
          
          IMPORTANT DIVERSITY GUIDELINES FOR INTERVIEW RESPONSES:
          - AVOID GENERIC DEFAULTS: Do not default to common habits like "drinking coffee in the morning"
          - UNIQUE MORNING ROUTINES: Create specific, individualized morning routines that fit the persona
          - VARIED CONSUMPTION: Some personas may dislike coffee, prefer tea, or have other beverages
          - CULTURAL SPECIFICITY: Reflect cultural background in daily routine descriptions
          - OCCUPATION IMPACT: Consider how their job affects their daily schedule and habits
          - SOCIOECONOMIC REALISM: Reflect how income level would affect lifestyle choices
          - HEALTH FACTORS: Consider dietary restrictions, preferences, or health consciousness
          - REGIONAL DIFFERENCES: Account for regional differences in daily habits and preferences
          
          Generate plausible responses to the preset interview questions 
          that match the persona's characteristics, traits, and speaking style.
          Ensure responses reflect the persona's demographic information, psychological traits, and knowledge domains.
          Include behavioral inconsistencies where appropriate based on their trait profile.
          For each question in each section, provide a response in the "response" field of each question object.` 
        },
        { 
          role: "user", 
          content: `Generate plausible interview responses for this persona:
          ${JSON.stringify(personaTraits, null, 2)}
          
          For each question in each interview section, add a realistic response that this persona would give.
          Return the complete interview_sections array with the responses added as JSON, no markdown formatting.` 
        }
      ],
      temperature: 0.9, // Increased from 0.8 to encourage more diversity
    }),
  });

  if (!interviewResponse.ok) {
    const errorData = await interviewResponse.text();
    console.error("OpenAI API error (interview):", errorData);
    throw new Error(`OpenAI API error: ${interviewResponse.status}`);
  }

  const interviewData = await interviewResponse.json();
  
  try {
    const content = interviewData.choices[0].message.content;
    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    const parsedResponse = JSON.parse(jsonContent);
    console.log("Successfully parsed interview responses");
    
    return parsedResponse;
  } catch (e) {
    console.error("Error parsing interview responses:", e);
    console.error("Raw content:", interviewData.choices[0].message.content);
    // Return null if parsing fails
    return null;
  }
}
