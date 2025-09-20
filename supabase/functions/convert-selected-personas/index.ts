import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConvertSelectedPersonasRequest {
  personaIds: string[];
  userId: string;
}

interface ConversionResult {
  persona_id: string;
  name: string;
  status: 'completed' | 'failed';
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { personaIds, userId }: ConvertSelectedPersonasRequest = await req.json();

    console.log(`🚀 Starting conversion of ${personaIds.length} selected personas for user ${userId}`);

    if (!personaIds || !Array.isArray(personaIds) || personaIds.length === 0) {
      throw new Error('No persona IDs provided');
    }

    if (personaIds.length > 10) {
      throw new Error('Maximum 10 personas can be converted at once');
    }

    // Fetch the selected personas
    const { data: personas, error: fetchError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile, user_id')
      .in('persona_id', personaIds)
      .eq('creation_completed', true);

    if (fetchError) {
      console.error('❌ Error fetching personas:', fetchError);
      throw fetchError;
    }

    if (!personas || personas.length === 0) {
      throw new Error('No personas found with the provided IDs');
    }

    console.log(`📋 Found ${personas.length} personas to convert:`, personas.map(p => p.name));

    const results: ConversionResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process each persona
    for (const persona of personas) {
      console.log(`\n🔄 Converting persona: ${persona.name} (${persona.persona_id})`);
      
      try {
        const fullProfile = persona.full_profile as Record<string, any> || {};
        
        // Generate missing political_narrative if needed
        if (!fullProfile.political_narrative) {
          console.log(`📝 Generating political_narrative for ${persona.name}...`);
          fullProfile.political_narrative = generatePoliticalNarrative(fullProfile);
        }

        // Generate missing prompt_shaping if needed
        if (!fullProfile.prompt_shaping) {
          console.log(`📝 Generating prompt_shaping for ${persona.name}...`);
          fullProfile.prompt_shaping = generatePromptShaping(fullProfile);
        }

        // Update the persona with the new format
        const { error: updateError } = await supabase
          .from('v4_personas')
          .update({ 
            full_profile: fullProfile,
            updated_at: new Date().toISOString()
          })
          .eq('persona_id', persona.persona_id);

        if (updateError) {
          console.error(`❌ Failed to update ${persona.name}:`, updateError);
          throw updateError;
        }

        console.log(`✅ Successfully converted ${persona.name}`);
        results.push({
          persona_id: persona.persona_id,
          name: persona.name,
          status: 'completed'
        });
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to convert ${persona.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        results.push({
          persona_id: persona.persona_id,
          name: persona.name,
          status: 'failed',
          error: errorMessage
        });
        failCount++;
      }
    }

    console.log(`\n🎯 Conversion complete! ✅${successCount} succeeded, ❌${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: personas.length,
        succeeded: successCount,
        failed: failCount,
        results: results,
        message: `Conversion complete! ${successCount} succeeded, ${failCount} failed`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Edge function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Helper function to generate political_narrative
function generatePoliticalNarrative(fullProfile: Record<string, any>): string {
  const identity = fullProfile.identity || {};
  const motivation = fullProfile.motivation_profile || {};
  
  // Generate a basic political narrative based on persona data
  const age = identity.age || 'unknown age';
  const occupation = identity.occupation || 'unknown occupation';
  const location = identity.location?.city || identity.location || 'unknown location';
  
  return `A ${age}-year-old ${occupation} from ${location} with moderate political views, ` +
         `focusing on practical solutions rather than ideological positions. ` +
         `Values civic engagement and community involvement while maintaining ` +
         `skepticism of extreme political rhetoric from any direction.`;
}

// Helper function to generate prompt_shaping
function generatePromptShaping(fullProfile: Record<string, any>): Record<string, any> {
  const communication = fullProfile.communication_style || {};
  const motivation = fullProfile.motivation_profile || {};
  const identity = fullProfile.identity || {};
  
  return {
    voice_foundation: {
      formality: communication.formality || "casual",
      directness: communication.directness || "balanced", 
      pace_rhythm: communication.pace_rhythm || "measured",
      positivity: communication.positivity || "neutral",
      empathy_level: communication.empathy_level || 0.7
    },
    style_markers: {
      metaphor_domains: ["everyday life", "work", "relationships"],
      humor_style: communication.humor_style || "situational",
      storytelling_vs_bullets: 0.6
    },
    primary_motivations: motivation.primary_motivation_labels || ["security", "belonging"],
    deal_breakers: motivation.deal_breakers || ["dishonesty", "disrespect"],
    honesty_vector: {
      baseline: 0.8,
      work: 0.7,
      home: 0.9,
      public: 0.6,
      distortions: ["white lies", "diplomatic omissions"]
    },
    bias_vector: {
      top_cognitive: ["confirmation", "anchoring"],
      top_social: ["in-group", "authority"],
      mitigation_playbook: ["seek diverse perspectives", "question assumptions"]
    },
    context_switches: {
      work: "more formal and diplomatic",
      home: "relaxed and authentic", 
      online: "cautious and measured"
    },
    current_focus: identity.occupation || "personal and professional growth"
  };
}