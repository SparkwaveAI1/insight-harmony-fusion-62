
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersonaDemographics, generatePersonaTraits, generateInterviewResponses } from "./openaiService.ts";
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
    
    console.log('Step 2: Generating comprehensive trait and behavioral profile');
    
    // STEP 2: Generate comprehensive trait profile, behavioral modulation, emotional triggers, etc.
    const comprehensiveProfile = await generatePersonaTraits(basePersona, prompt);
    console.log('Step 2 Complete: Generated comprehensive profile');
    
    // Merge the comprehensive profile into the base persona
    basePersona.trait_profile = comprehensiveProfile.trait_profile;
    basePersona.behavioral_modulation = comprehensiveProfile.behavioral_modulation;
    basePersona.linguistic_profile = comprehensiveProfile.linguistic_profile;
    basePersona.emotional_triggers = comprehensiveProfile.emotional_triggers;
    basePersona.simulation_directives = comprehensiveProfile.simulation_directives;
    basePersona.preinterview_tags = comprehensiveProfile.preinterview_tags;
    
    // Validate and clean the trait profile
    const validatedPersona = validateAndCleanTraits(basePersona);
    
    console.log('Step 3: Generating interview responses');
    
    // STEP 3: Generate interview responses
    let interviewResponses;
    try {
      interviewResponses = await generateInterviewResponses(validatedPersona);
      console.log(`Step 3 Complete: Generated ${interviewResponses.length} interview sections`);
    } catch (error) {
      console.error('Failed to generate interview responses:', error);
      interviewResponses = [
        {
          section_title: "Personal Background",
          responses: [
            {
              question: "Tell me about yourself",
              answer: `I'm ${validatedPersona.name}, and I'd be happy to share more about my background and experiences.`
            }
          ]
        }
      ];
    }

    // Add interview responses to persona (as flat array, not nested object)
    validatedPersona.interview_sections = interviewResponses;

    console.log('=== PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name}`);
    console.log(`- Demographics: ✓`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.length || 0} sections)`);
    console.log(`- Behavioral modulation: ✓`);
    console.log(`- Linguistic profile: ✓`);
    console.log(`- Simulation directives: ✓`);

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
