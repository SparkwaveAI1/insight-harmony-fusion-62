import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./operations/savePersona";
import { Persona } from "./types";
import { toast } from "sonner";
import { logTraitValidation } from "./traitValidation";
import { validatePersonaCompleteness, logPersonaValidation } from "./validation/personaValidation";

// Now generates PersonaV2 format and saves to personas_v2 table
export const generatePersona = async (prompt: string): Promise<Persona | null> => {
  try {
    toast.info("Generating persona...", {
      id: "persona-generation",
      duration: 10000,
    });
    
    console.log("=== STARTING PersonaV2 GENERATION ===");
    console.log("Starting PersonaV2 generation for prompt:", prompt);

    // Get the current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("❌ Error getting user:", userError);
      toast.error("Authentication error - please try logging in again", { id: "persona-generation" });
      return null;
    }
    
    const userId = user?.id;
    console.log("Current user ID:", userId);

    if (!userId) {
      console.error("❌ No authenticated user found");
      toast.error("You must be logged in to create personas", { id: "persona-generation" });
      return null;
    }

    console.log("Calling generate-persona edge function (PersonaV2)...");
    const { data, error } = await supabase.functions.invoke('generate-persona', {
      body: { prompt }
    });

    if (error) {
      console.error("❌ Error calling generate-persona function:", error);
      toast.error(`Failed to generate persona: ${error.message}`, { id: "persona-generation" });
      return null;
    }

    console.log("Edge function response received:", data);

    if (!data.success || !data.persona) {
      console.error("❌ PersonaV2 generation failed:", data.error || "Unknown error");
      toast.error(`Failed to generate persona: ${data.error || "Unknown error"}`, { id: "persona-generation" });
      return null;
    }

    const personaV2 = data.persona;
    console.log("✅ Successfully generated PersonaV2:", personaV2.identity.name);
    
    console.log("=== SAVING PersonaV2 TO DATABASE ===");
    try {
      // Create the personas_v2 record
      const v2Record = {
        persona_id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        name: personaV2.identity.name,
        description: personaV2.identity.core_identity_narrative,
        persona_data: personaV2,
        persona_type: 'humanoid',
        is_public: false
      };
      
      console.log("Saving PersonaV2 to personas_v2 table...");
      const { data: savedV2, error: saveV2Error } = await supabase
        .from('personas_v2')
        .insert(v2Record)
        .select()
        .single();
      
      if (saveV2Error) {
        console.error("❌ Failed to save PersonaV2:", saveV2Error);
        toast.error(`Failed to save persona: ${saveV2Error.message}`, { id: "persona-generation" });
        return null;
      }
      
      console.log("✅ PersonaV2 saved successfully with ID:", savedV2.persona_id);
      
      // Convert PersonaV2 to V1 format for backward compatibility
      const v1Persona = convertV2ToV1(savedV2, personaV2);
      
      toast.success(`"${v1Persona.name}" created successfully!`, { id: "persona-generation" });
      console.log("=== PersonaV2 GENERATION COMPLETED ===");
      return v1Persona;
      
    } catch (saveError: any) {
      console.error("❌ Error saving PersonaV2 to database:", saveError);
      toast.error(`Error saving persona: ${saveError.message || "Unknown database error"}`, { id: "persona-generation" });
      return null;
    }
  } catch (error: any) {
    console.error("❌ Unexpected error in generatePersona:", error);
    toast.error(`An unexpected error occurred: ${error.message || "Unknown error"}`, { id: "persona-generation" });
    return null;
  }
};

// Convert PersonaV2 to V1 format for backward compatibility
function convertV2ToV1(savedV2: any, personaV2: any): Persona {
  return {
    persona_id: savedV2.persona_id,
    id: savedV2.id,
    name: savedV2.name,
    description: savedV2.description,
    creation_date: savedV2.created_at,
    created_at: savedV2.created_at,
    user_id: savedV2.user_id,
    is_public: savedV2.is_public,
    profile_image_url: savedV2.profile_image_url,
    persona_type: savedV2.persona_type,
    persona_version: "2.0",
    metadata: {
      age: personaV2.identity.age,
      gender: personaV2.identity.gender,
      occupation: personaV2.life_context.occupation.title,
      location: personaV2.life_context.current_location.city,
      education_level: personaV2.life_context.education.highest_degree,
      income_level: personaV2.life_context.financial_situation.income_stability,
      enhanced_metadata_version: 2
    },
    trait_profile: {
      big_five: personaV2.cognitive_profile.big_five,
      moral_foundations: personaV2.cognitive_profile.moral_foundations,
      world_values: {
        traditional_vs_secular: 0.5,
        survival_vs_self_expression: 0.5,
        materialist_vs_postmaterialist: 0.5
      }
    },
    behavioral_modulation: {
      communication_style: {
        formality_level: personaV2.social_cognition.communication_style.formality_preference,
        emotional_expressiveness: personaV2.social_cognition.communication_style.emotional_expressiveness,
        directness: personaV2.social_cognition.communication_style.directness
      }
    },
    linguistic_profile: {
      default_output_length: "moderate",
      speech_register: "hybrid",
      speaking_style: {
        uses_neutral_fillers: true,
        sentence_revisions: true,
        topic_length_variability: true,
        contradiction_tolerance: true,
        trust_modulated_tone: true,
        mirroring_tendency: true
      },
      sample_phrasing: []
    },
    interview_sections: [{
      section_title: "Personal Background",
      responses: [{
        question: "Tell me about yourself",
        answer: personaV2.identity.core_identity_narrative
      }]
    }],
    emotional_triggers: {
      positive_triggers: personaV2.emotional_triggers.positive_activators,
      negative_triggers: personaV2.emotional_triggers.negative_activators
    },
    simulation_directives: {
      encourage_contradiction: true,
      emotional_asymmetry: true,
      stress_behavior_expected: true,
      inconsistency_is_valid: true,
      response_length_variability: true
    },
    preinterview_tags: ["PersonaV2", "demographic_match", "trait_validated"]
  };
}
