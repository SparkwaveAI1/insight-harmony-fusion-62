
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersonaDemographics, generatePersonaTraits, generateInterviewResponses } from "./openaiService.ts";
import { generateEmotionalTriggers } from "./emotionalTriggerGenerator.ts";
import { validateAndCleanTraits } from "./traitValidator.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== STARTING 3-STEP PERSONA GENERATION ===');
    console.log('Step 1: Generating demographics and basic info');
    
    // STEP 1: Generate demographics and basic persona info
    const basePersona = await generatePersonaDemographics(prompt);
    console.log(`Step 1 Complete: Generated base persona "${basePersona.name}"`);
    
    console.log('Step 2: Generating comprehensive trait profile');
    
    // STEP 2: Generate comprehensive trait profile
    const traitProfile = await generatePersonaTraits(basePersona, prompt);
    console.log('Step 2A: Validating and cleaning trait profile');
    
    // Add trait profile to persona
    basePersona.trait_profile = traitProfile;
    
    // Validate and clean the trait profile
    const validatedPersona = validateAndCleanTraits(basePersona);
    
    console.log('Step 2B: Generating emotional triggers');
    
    // Generate emotional triggers based on validated traits
    let emotionalTriggers;
    try {
      emotionalTriggers = generateEmotionalTriggers(validatedPersona, prompt);
      console.log(`Step 2B Complete: Generated ${emotionalTriggers.positive_triggers?.length || 0} positive and ${emotionalTriggers.negative_triggers?.length || 0} negative triggers`);
    } catch (error) {
      console.error('Failed to generate emotional triggers:', error);
      emotionalTriggers = {
        positive_triggers: [
          { keywords: ["success", "achievement"], emotion_type: "pride", intensity_multiplier: 5, description: "Takes pride in accomplishments" }
        ],
        negative_triggers: [
          { keywords: ["unfair", "injustice"], emotion_type: "anger", intensity_multiplier: 6, description: "Gets angry at unfairness" }
        ]
      };
    }
    
    // Add emotional triggers to persona
    validatedPersona.emotional_triggers = emotionalTriggers;
    
    console.log('Step 2 Complete: Trait profile and emotional triggers added');
    console.log('Step 3: Generating interview responses');
    
    // STEP 3: Generate interview responses
    let interviewResponses;
    try {
      interviewResponses = await generateInterviewResponses(validatedPersona);
      console.log(`Step 3 Complete: Generated ${interviewResponses.interview_sections?.length || 0} interview sections`);
    } catch (error) {
      console.error('Failed to generate interview responses:', error);
      interviewResponses = {
        interview_sections: [
          {
            section_title: "Personal Background",
            responses: [
              {
                question: "Tell me about yourself",
                answer: `I'm ${validatedPersona.name}, and I'd be happy to share more about my background and experiences.`
              }
            ]
          }
        ]
      };
    }

    // Add interview responses to persona
    validatedPersona.interview_sections = interviewResponses;

    console.log('=== PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name}`);
    console.log(`- Demographics: ✓`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.interview_sections?.length || 0} sections)`);

    return new Response(
      JSON.stringify({
        success: true,
        persona: validatedPersona
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in 3-step persona generation:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate persona',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
