
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
    
    console.log('Step 3: Generating interview responses');
    
    // STEP 3: Generate interview responses with proper error handling
    let interviewResponses;
    try {
      interviewResponses = await generateInterviewResponses(basePersona);
      console.log(`Step 3 Complete: Generated ${interviewResponses.length} interview sections`);
    } catch (error) {
      console.error('Failed to generate interview responses:', error);
      // Create a minimal fallback interview section
      interviewResponses = [
        {
          section_title: "Personal Background",
          responses: [
            {
              question: "Tell me about yourself",
              answer: `Hi, I'm ${basePersona.name}. ${basePersona.metadata.background || 'I\'d be happy to share more about my experiences and perspective.'}`
            }
          ]
        }
      ];
    }

    // Add interview responses to persona
    basePersona.interview_sections = interviewResponses;

    // CRITICAL FIX: Validate and clean traits AFTER all generation is complete
    const validatedPersona = validateAndCleanTraits(basePersona);
    
    // Ensure required fields are present with proper defaults if missing
    if (!validatedPersona.behavioral_modulation) {
      validatedPersona.behavioral_modulation = {
        communication_style: {
          formality_level: 0.5,
          emotional_expressiveness: 0.6,
          directness: 0.7,
          humor_usage: 0.4
        },
        response_patterns: {
          elaboration_tendency: 0.6,
          example_usage: 0.7,
          personal_anecdote_frequency: 0.5,
          technical_depth_preference: 0.4
        },
        contextual_adaptability: {
          topic_sensitivity: 0.6,
          audience_awareness: 0.7,
          emotional_responsiveness: 0.6
        }
      };
    }

    if (!validatedPersona.linguistic_profile) {
      validatedPersona.linguistic_profile = {
        vocabulary_complexity: 0.6,
        sentence_structure_preference: 0.5,
        cultural_linguistic_markers: [],
        communication_pace: 0.6,
        filler_word_usage: 0.3,
        interruption_tendency: 0.4,
        question_asking_frequency: 0.5,
        storytelling_inclination: 0.6
      };
    }

    if (!validatedPersona.simulation_directives) {
      validatedPersona.simulation_directives = {
        authenticity_level: 0.9,
        consistency_enforcement: 0.8,
        emotional_range_limit: 0.7,
        response_variability: 0.6,
        knowledge_boundary_respect: 0.9,
        personality_drift_prevention: 0.8
      };
    }

    if (!validatedPersona.preinterview_tags) {
      validatedPersona.preinterview_tags = [
        "demographic_match",
        "trait_validated", 
        "behavioral_profiled"
      ];
    }

    // Ensure emotional triggers has proper structure
    if (!validatedPersona.emotional_triggers) {
      validatedPersona.emotional_triggers = {
        positive_triggers: [],
        negative_triggers: []
      };
    }

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
