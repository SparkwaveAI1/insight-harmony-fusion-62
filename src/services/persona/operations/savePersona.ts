import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";

export async function savePersona(persona: Persona): Promise<Persona | null> {
  try {
    console.log("💾 savePersona called with:", {
      persona_id: persona.persona_id,
      name: persona.name,
      user_id: persona.user_id,
      hasProfileData: !!persona,
      version: persona.version,
      is_public: persona.is_public
    });

    const insertData = {
      persona_id: persona.persona_id,
      name: persona.name,
      profile_data: persona,
      user_id: persona.user_id,
      creation_completed: true,
      is_public: persona.is_public || false
    };

    console.log("📤 Attempting database insert to v4_personas...");

    const { data, error } = await supabase
      .from('v4_personas')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database error saving persona:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertData: {
          persona_id: insertData.persona_id,
          name: insertData.name,
          user_id: insertData.user_id
        }
      });
      throw error; // Throw instead of returning null so we can see the actual error
    }

    if (!data) {
      console.error('❌ No data returned from insert');
      return null;
    }

    console.log("✅ Persona saved successfully to database:", data.persona_id);
    return persona;
  } catch (error: any) {
    console.error('❌ Exception in savePersona:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    throw error; // Re-throw to propagate to caller
  }
}