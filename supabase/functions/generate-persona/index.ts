
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersona, generateInterviewResponses } from "./openaiService.ts";
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

    console.log('Generating persona traits with enhanced architecture');
    
    // Generate the base persona
    const rawPersona = await generatePersona(prompt);
    
    // Validate and clean the trait profile
    const validatedPersona = validateAndCleanTraits(rawPersona);
    
    console.log('Trait profile sample:', JSON.stringify({
      openness: validatedPersona.trait_profile.big_five.openness,
      conscientiousness: validatedPersona.trait_profile.big_five.conscientiousness,
      extraversion: validatedPersona.trait_profile.big_five.extraversion,
      agreeableness: validatedPersona.trait_profile.big_five.agreeableness,
      neuroticism: validatedPersona.trait_profile.big_five.neuroticism
    }));

    // Generate emotional triggers with error handling
    let emotionalTriggers;
    try {
      emotionalTriggers = generateEmotionalTriggers(validatedPersona, prompt);
    } catch (error) {
      console.error('Failed to generate emotional triggers, using fallback:', error);
      emotionalTriggers = {
        positive_triggers: [
          { keywords: ["success", "achievement"], emotion_type: "pride", intensity_multiplier: 5, description: "Takes pride in accomplishments" }
        ],
        negative_triggers: [
          { keywords: ["unfair", "injustice"], emotion_type: "anger", intensity_multiplier: 6, description: "Gets angry at unfairness" }
        ]
      };
    }

    // Generate interview responses with error handling
    let interviewResponses;
    try {
      interviewResponses = await generateInterviewResponses(validatedPersona);
    } catch (error) {
      console.error('Failed to generate interview responses, using fallback:', error);
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

    // Combine everything into the final persona
    const enhancedPersona = {
      ...validatedPersona,
      emotional_triggers: emotionalTriggers,
      interview_sections: interviewResponses
    };

    console.log('Returning generated persona with enhanced metadata');

    return new Response(
      JSON.stringify(enhancedPersona),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in persona generation:', error);
    
    return new Response(
      JSON.stringify({ 
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
