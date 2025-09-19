import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trait assignment logic (embedded directly in edge function)
function assignRealisticTraits(persona: any, demographics: any) {
  const enhanced = JSON.parse(JSON.stringify(persona)); // Deep clone
  
  // Initialize missing sections
  if (!enhanced.health_profile) {
    enhanced.health_profile = {
      bmi_category: "",
      chronic_conditions: [],
      mental_health_flags: [],
      medications: [],
      adherence_level: "",
      sleep_hours: 7,
      substance_use: { alcohol: "", cigarettes: "", vaping: "", marijuana: "" },
      fitness_level: "",
      diet_pattern: ""
    };
  }
  
  if (!enhanced.money_profile) {
    enhanced.money_profile = {
      attitude_toward_money: "",
      earning_context: "",
      spending_style: "",
      savings_investing_habits: { emergency_fund_months: 0, retirement_contributions: "", investing_style: "" },
      debt_posture: "",
      financial_stressors: [],
      money_conflicts: "",
      generosity_profile: ""
    };
  }

  // Apply age-based health conditions
  const age = demographics.age;
  if (age >= 45) {
    if (Math.random() < 0.35) { // 35% chance for hypertension after 45
      enhanced.health_profile.chronic_conditions.push("hypertension");
      enhanced.health_profile.medications.push("lisinopril");
    }
    if (age >= 50 && Math.random() < 0.15) { // 15% chance for diabetes after 50
      enhanced.health_profile.chronic_conditions.push("type_2_diabetes");
      enhanced.health_profile.medications.push("metformin");
    }
  }

  // Apply income-based financial stress
  const income = demographics.income?.toLowerCase() || "";
  if (income.includes("low") || income.includes("25000") || income.includes("35000")) {
    enhanced.money_profile.financial_stressors.push("credit_card_debt", "student_loans");
    enhanced.money_profile.debt_posture = "high_debt_stress";
  } else if (income.includes("middle") || income.includes("50000")) {
    if (Math.random() < 0.4) {
      enhanced.money_profile.financial_stressors.push("mortgage_payments");
    }
  }

  // Apply mental health based on stress levels
  if (enhanced.money_profile.financial_stressors.length > 1) {
    enhanced.health_profile.mental_health_flags.push("anxiety");
    if (Math.random() < 0.3) {
      enhanced.health_profile.medications.push("sertraline");
    }
  }

  return enhanced;
}

serve(async (req) => {
  console.log('Enhance persona statistics function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaId } = await req.json();
    console.log('Processing persona:', personaId);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get ONE persona by ID
    const { data: persona, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', personaId)
      .eq('statistical_enhancement_status', 'pending')
      .single();

    if (error || !persona) {
      console.error('Error fetching persona:', error);
      throw new Error(`Persona not found or already processed: ${personaId}`);
    }

    console.log('Found persona:', persona.name);

    // Extract demographics for trait assignment
    const fullProfile = persona.full_profile;
    const demographics = {
      age: fullProfile?.identity?.age || 25,
      income: fullProfile?.identity?.income_bracket || "middle",
      region: fullProfile?.identity?.location?.region || "midwest",
      ethnicity: fullProfile?.identity?.ethnicity || "caucasian",
      gender: fullProfile?.identity?.gender || "non-binary"
    };

    console.log('Demographics:', demographics);

    // Store original for comparison
    const beforeHealth = {
      chronicConditions: fullProfile?.health_profile?.chronic_conditions || [],
      medications: fullProfile?.health_profile?.medications || [],
      financialStressors: fullProfile?.money_profile?.financial_stressors || []
    };

    // Apply statistical traits
    const enhancedPersona = assignRealisticTraits(fullProfile, demographics);

    const afterHealth = {
      chronicConditions: enhancedPersona.health_profile.chronic_conditions,
      medications: enhancedPersona.health_profile.medications,
      financialStressors: enhancedPersona.money_profile.financial_stressors
    };

    // For dry run, just return the comparison without saving
    console.log('Enhancement complete for:', personaId);
    console.log('Before:', beforeHealth);
    console.log('After:', afterHealth);

    return new Response(JSON.stringify({
      success: true,
      personaId: personaId,
      personaName: persona.name,
      demographics: demographics,
      before: beforeHealth,
      after: afterHealth,
      traitsAdded: {
        chronicConditions: afterHealth.chronicConditions.filter(c => !beforeHealth.chronicConditions.includes(c)),
        medications: afterHealth.medications.filter(m => !beforeHealth.medications.includes(m)),
        financialStressors: afterHealth.financialStressors.filter(f => !beforeHealth.financialStressors.includes(f))
      }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in enhance-persona-statistics function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});