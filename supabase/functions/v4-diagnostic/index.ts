import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { persona_id, user_message } = await req.json();
    
    console.log("=== V4 DIAGNOSTIC START ===");
    console.log("Persona ID:", persona_id);
    console.log("User message:", user_message);

    // Fetch persona
    const { data: persona, error: personaError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', persona_id)
      .single();

    if (personaError || !persona) {
      throw new Error(`Persona not found: ${personaError?.message || 'Unknown error'}`);
    }

    console.log("Persona loaded:", persona.name);
    
    // Extract key data for analysis
    const fullProfile = persona.full_profile || {};
    const conversationSummary = persona.conversation_summary || {};
    
    console.log("Full profile structure:");
    console.log("- Identity:", !!fullProfile.identity);
    console.log("- Motivation profile:", !!fullProfile.motivation_profile);
    console.log("- Communication style:", !!fullProfile.communication_style);
    console.log("- Emotional profile:", !!fullProfile.emotional_profile);
    console.log("- Bias profile:", !!fullProfile.bias_profile);
    
    // Check specific trait paths
    const traitChecks = {
      "motivation_drivers_care": fullProfile?.motivation_profile?.primary_drivers?.care,
      "motivation_drivers_family": fullProfile?.motivation_profile?.primary_drivers?.family,
      "motivation_drivers_security": fullProfile?.motivation_profile?.primary_drivers?.security,
      "communication_directness": fullProfile?.communication_style?.voice_foundation?.directness,
      "communication_formality": fullProfile?.communication_style?.voice_foundation?.formality,
      "emotional_negative_triggers": fullProfile?.emotional_profile?.negative_triggers,
      "emotional_positive_triggers": fullProfile?.emotional_profile?.positive_triggers,
      "bias_confirmation": fullProfile?.bias_profile?.cognitive?.confirmation,
      "bias_loss_aversion": fullProfile?.bias_profile?.cognitive?.loss_aversion,
      "identity_occupation": fullProfile?.identity?.occupation,
      "identity_age": fullProfile?.identity?.age,
      "truth_honesty_baseline": fullProfile?.truth_honesty_profile?.baseline_honesty,
      "deal_breakers": fullProfile?.motivation_profile?.deal_breakers,
    };
    
    console.log("Trait path values:");
    Object.entries(traitChecks).forEach(([path, value]) => {
      console.log(`- ${path}:`, typeof value, value);
    });
    
    // Simple topic analysis
    const lowerMessage = user_message.toLowerCase();
    const detectedTopics = [];
    
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
      detectedTopics.push('work');
    }
    if (lowerMessage.includes('family') || lowerMessage.includes('children') || lowerMessage.includes('spouse')) {
      detectedTopics.push('family');
    }
    if (lowerMessage.includes('money') || lowerMessage.includes('financial') || lowerMessage.includes('cost')) {
      detectedTopics.push('money');
    }
    if (lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('doctor')) {
      detectedTopics.push('health');
    }
    
    console.log("Detected topics:", detectedTopics);
    
    // Check trait relevance for detected topics
    const relevantTraits = [];
    
    if (detectedTopics.includes('work') && traitChecks.identity_occupation) {
      relevantTraits.push({
        trait: "identity.occupation",
        value: traitChecks.identity_occupation,
        reason: "Work topic detected"
      });
    }
    
    if (detectedTopics.includes('family') && traitChecks.motivation_drivers_family) {
      relevantTraits.push({
        trait: "motivation_profile.primary_drivers.family",
        value: traitChecks.motivation_drivers_family,
        reason: "Family topic detected"
      });
    }
    
    if (detectedTopics.includes('money') && traitChecks.motivation_drivers_security) {
      relevantTraits.push({
        trait: "motivation_profile.primary_drivers.security", 
        value: traitChecks.motivation_drivers_security,
        reason: "Money/security topic detected"
      });
    }
    
    // Always check some core traits
    if (traitChecks.communication_directness) {
      relevantTraits.push({
        trait: "communication_style.voice_foundation.directness",
        value: traitChecks.communication_directness,
        reason: "Core communication trait"
      });
    }
    
    if (traitChecks.truth_honesty_baseline) {
      relevantTraits.push({
        trait: "truth_honesty_profile.baseline_honesty",
        value: traitChecks.truth_honesty_baseline,
        reason: "Core honesty trait"
      });
    }
    
    console.log("Relevant traits found:", relevantTraits.length);
    relevantTraits.forEach(trait => {
      console.log(`- ${trait.trait}: ${trait.value} (${trait.reason})`);
    });
    
    // Generate diagnostic opinion
    let diagnosticOpinion = "";
    if (relevantTraits.length === 0) {
      diagnosticOpinion = "No relevant traits found - this would result in generic response";
    } else {
      const demographics = {
        name: fullProfile?.identity?.name || "Unknown",
        age: fullProfile?.identity?.age || "Unknown",
        occupation: fullProfile?.identity?.occupation || "Unknown"
      };
      
      diagnosticOpinion = `As ${demographics.name}, a ${demographics.age}-year-old ${demographics.occupation}, `;
      
      if (relevantTraits.some(t => t.trait.includes('family'))) {
        diagnosticOpinion += "considering my family values, ";
      }
      if (relevantTraits.some(t => t.trait.includes('security'))) {
        diagnosticOpinion += "given my security concerns, ";
      }
      if (relevantTraits.some(t => t.trait.includes('directness'))) {
        const directness = relevantTraits.find(t => t.trait.includes('directness'))?.value;
        if (directness === 'high') {
          diagnosticOpinion += "I'll be direct: ";
        }
      }
      
      diagnosticOpinion += "this is an important topic that requires thoughtful consideration.";
    }
    
    console.log("Generated opinion:", diagnosticOpinion);
    
    // Return comprehensive diagnostic data
    const diagnosticResult = {
      persona_name: persona.name,
      user_message,
      analysis: {
        full_profile_exists: !!persona.full_profile,
        conversation_summary_exists: !!persona.conversation_summary,
        detected_topics: detectedTopics,
        relevant_traits_count: relevantTraits.length,
        relevant_traits: relevantTraits,
        trait_path_checks: traitChecks,
        opinion_generated: diagnosticOpinion,
        is_generic: diagnosticOpinion.includes("No relevant traits"),
        demographics: {
          name: fullProfile?.identity?.name,
          age: fullProfile?.identity?.age,
          occupation: fullProfile?.identity?.occupation,
          location: fullProfile?.identity?.location?.city
        }
      },
      full_profile_structure: {
        top_level_keys: Object.keys(fullProfile),
        identity_keys: Object.keys(fullProfile?.identity || {}),
        motivation_keys: Object.keys(fullProfile?.motivation_profile || {}),
        communication_keys: Object.keys(fullProfile?.communication_style || {}),
        emotional_keys: Object.keys(fullProfile?.emotional_profile || {}),
        bias_keys: Object.keys(fullProfile?.bias_profile || {})
      },
      next_steps: relevantTraits.length === 0 
        ? "No traits are being matched - check trait path definitions and analysis logic"
        : "Traits are being found - check opinion synthesis and communication execution"
    };

    return new Response(JSON.stringify(diagnosticResult, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});