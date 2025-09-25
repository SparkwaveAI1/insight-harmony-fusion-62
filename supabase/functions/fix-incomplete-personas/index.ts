import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { method } = req;

  if (method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { personaId, forceRegenerate = false } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the persona
    const { data: persona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('id', personaId)
      .single();

    if (fetchError || !persona) {
      throw new Error(`Failed to fetch persona: ${fetchError?.message}`);
    }

    console.log(`Analyzing persona: ${persona.name} (${personaId})`);

    // Analyze completeness
    const analysis = analyzePersonaCompleteness(persona.persona_data);
    console.log('Completeness analysis:', analysis);

    let updatedPersonaData;

    if (analysis.completenessScore < 0.8 || forceRegenerate) {
      console.log(`Persona is ${Math.round(analysis.completenessScore * 100)}% complete. Regenerating...`);
      
      // Regenerate the persona completely using original specifications
      const regenerationInputs = {
        role: persona.occupation || 'professional',
        region: persona.region || 'California',
        urbanicity: persona.urbanicity || 'urban', 
        age_range: persona.age ? `${persona.age - 2}-${persona.age + 2}` : '25-35',
        ethnicity: persona.ethnicity || null,
        name_preference: persona.name // Try to keep the same name if possible
      };

      // Call the fixed v4-persona-call1 function
      const regenerateResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/v4-persona-call1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regenerationInputs),
      });

      if (!regenerateResponse.ok) {
        throw new Error(`Regeneration failed: ${regenerateResponse.status}`);
      }

      const regenerateData = await regenerateResponse.json();
      if (!regenerateData.success) {
        throw new Error(`Regeneration failed: ${regenerateData.error}`);
      }

      updatedPersonaData = regenerateData.persona_data;

      // Preserve original name if user didn't want it changed
      if (regenerationInputs.name_preference && regenerationInputs.name_preference !== 'Unnamed Persona') {
        updatedPersonaData.identity.name = regenerationInputs.name_preference;
      }

    } else {
      console.log('Persona is sufficiently complete, no modifications needed - preserving OpenAI output integrity');
      // DISABLED: Validation contamination removed - no targeted fixes applied
      // updatedPersonaData = applyTargetedFixes(persona.persona_data, analysis.missingFields);
      updatedPersonaData = persona.persona_data; // Use original data without modifications
    }

    // Update the persona in database
    const { error: updateError } = await supabase
      .from('v4_personas')
      .update({
        name: updatedPersonaData.identity.name,
        age: updatedPersonaData.identity.age,
        occupation: updatedPersonaData.identity.occupation,
        region: updatedPersonaData.identity.location.region,
        urbanicity: updatedPersonaData.identity.location.urbanicity,
        ethnicity: updatedPersonaData.identity.ethnicity,
        persona_data: updatedPersonaData,
        enrichment_status: 'complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', personaId);

    if (updateError) {
      throw new Error(`Failed to update persona: ${updateError.message}`);
    }

    // Final validation
    const finalAnalysis = analyzePersonaCompleteness(updatedPersonaData);
    
    return new Response(JSON.stringify({
      success: true,
      personaId,
      personaName: updatedPersonaData.identity.name,
      beforeCompleteness: analysis.completenessScore,
      afterCompleteness: finalAnalysis.completenessScore,
      missingFieldsFixed: analysis.missingFields.length - finalAnalysis.missingFields.length,
      actionTaken: analysis.completenessScore < 0.8 || forceRegenerate ? 'full_regeneration' : 'targeted_fixes'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Fix persona error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function analyzePersonaCompleteness(personaData: any) {
  const requiredSections = [
    'identity', 'daily_life', 'health_profile', 'relationships', 'money_profile',
    'motivation_profile', 'communication_style', 'humor_profile', 'truth_honesty_profile',
    'bias_profile', 'cognitive_profile', 'emotional_profile', 'attitude_narrative',
    'political_narrative', 'adoption_profile', 'prompt_shaping', 'sexuality_profile'
  ];

  const missingFields = [];
  let totalExpectedFields = 0;
  let presentFields = 0;

  // Check top-level sections
  requiredSections.forEach(section => {
    totalExpectedFields++;
    if (personaData[section]) {
      presentFields++;
    } else {
      missingFields.push(section);
    }
  });

  // Check critical identity fields
  const criticalIdentityFields = [
    'name', 'age', 'gender', 'pronouns', 'ethnicity', 'nationality', 
    'occupation', 'relationship_status', 'dependents', 'education_level', 'income_bracket'
  ];
  
  if (personaData.identity) {
    criticalIdentityFields.forEach(field => {
      totalExpectedFields++;
      if (personaData.identity[field] !== undefined && personaData.identity[field] !== null) {
        presentFields++;
      } else {
        missingFields.push(`identity.${field}`);
      }
    });
  }

  // Check location sub-object
  if (personaData.identity?.location) {
    ['city', 'region', 'country', 'urbanicity'].forEach(field => {
      totalExpectedFields++;
      if (personaData.identity.location[field]) {
        presentFields++;
      } else {
        missingFields.push(`identity.location.${field}`);
      }
    });
  } else {
    missingFields.push('identity.location');
    totalExpectedFields += 4;
  }

  const completenessScore = totalExpectedFields > 0 ? presentFields / totalExpectedFields : 0;

  return {
    completenessScore,
    missingFields,
    totalExpectedFields,
    presentFields,
    isComplete: completenessScore >= 0.95 && missingFields.length === 0
  };
}

// DISABLED: Validation contamination removed - no data modification  
function applyTargetedFixes(personaData: any, missingFields: string[]): any {
  console.log('⚠️ applyTargetedFixes disabled - preserving OpenAI output integrity');
  console.log('Missing fields detected but not fixing:', missingFields);
  
  // READ-ONLY: Return original persona without applying hardcoded defaults
  return personaData;
}