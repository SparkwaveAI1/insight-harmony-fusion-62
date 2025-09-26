import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting bulk persona description update...');

    // Get personas without descriptions
    const { data: personas, error: fetchError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile')
      .or('full_profile->description.is.null,full_profile->description.eq.')
      .limit(50); // Process in batches

    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!personas || personas.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No personas found without descriptions',
          updated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${personas.length} personas without descriptions`);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let updated = 0;
    const errors: string[] = [];

    // Process personas in smaller batches to avoid timeout
    for (const persona of personas) {
      try {
        console.log(`Generating description for ${persona.name} (${persona.persona_id})`);
        
        const description = await generateDescription(persona, openaiApiKey);
        
        if (description) {
          const { error: updateError } = await supabase
            .from('v4_personas')
            .update({ 
              full_profile: {
                ...persona.full_profile,
                description: description
              }
            })
            .eq('persona_id', persona.persona_id);

          if (updateError) {
            console.error(`Failed to update ${persona.name}:`, updateError.message);
            errors.push(`${persona.name}: ${updateError.message}`);
          } else {
            updated++;
            console.log(`✅ Updated description for ${persona.name}`);
          }
        } else {
          errors.push(`${persona.name}: Failed to generate description`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing ${persona.name}:`, error instanceof Error ? error.message : String(error));
        errors.push(`${persona.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`Bulk update completed. Updated: ${updated}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updated,
        total: personas.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Updated ${updated} of ${personas.length} personas`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk update error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update persona descriptions' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

async function generateDescription(persona: any, openaiApiKey: string): Promise<string | null> {
  try {
    // Extract key traits for description generation
    const fullProfile = persona.full_profile || {};
    const traits = fullProfile.trait_profile || {};
    const metadata = fullProfile.metadata || {};
    
    // Build trait summary for description
    const traitSummary = generateTraitSummary(traits, metadata);
    
    const prompt = `Generate a concise, engaging description (2-3 sentences, max 120 words) for this persona based on their traits and background:

Name: ${persona.name}
${traitSummary}

The description should:
- Capture their key personality traits and characteristics
- Be written in third person
- Sound natural and engaging
- Avoid technical jargon
- Focus on what makes them unique

Return only the description text, no additional formatting or explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing concise, engaging persona descriptions that capture personality and characteristics in a natural, human way.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openaiData = await response.json();
    const description = openaiData.choices?.[0]?.message?.content?.trim();

    return description || null;
    
  } catch (error) {
    console.error(`Error generating description for ${persona.name}:`, error);
    return null;
  }
}

function generateTraitSummary(traits: any, metadata: any): string {
  const summary: string[] = [];

  // Demographics
  if (metadata.age) summary.push(`Age: ${metadata.age}`);
  if (metadata.occupation) summary.push(`Occupation: ${metadata.occupation}`);
  if (metadata.location) summary.push(`Location: ${metadata.location}`);

  // Big Five traits
  if (traits.big_five) {
    const bigFive = traits.big_five;
    const traitDescriptions: string[] = [];
    
    if (bigFive.extraversion > 0.7) traitDescriptions.push("highly extraverted");
    else if (bigFive.extraversion < 0.3) traitDescriptions.push("introverted");
    
    if (bigFive.openness > 0.7) traitDescriptions.push("very open to experience");
    else if (bigFive.openness < 0.3) traitDescriptions.push("conventional");
    
    if (bigFive.conscientiousness > 0.7) traitDescriptions.push("highly conscientious");
    else if (bigFive.conscientiousness < 0.3) traitDescriptions.push("spontaneous");
    
    if (bigFive.agreeableness > 0.7) traitDescriptions.push("highly agreeable");
    else if (bigFive.agreeableness < 0.3) traitDescriptions.push("competitive");
    
    if (bigFive.neuroticism > 0.7) traitDescriptions.push("emotionally sensitive");
    else if (bigFive.neuroticism < 0.3) traitDescriptions.push("emotionally stable");
    
    if (traitDescriptions.length > 0) {
      summary.push(`Personality: ${traitDescriptions.join(", ")}`);
    }
  }

  // Values and motivations
  if (traits.world_values) {
    const worldValues = traits.world_values;
    if (worldValues.survival_vs_self_expression > 0.7) {
      summary.push("Values self-expression and quality of life");
    } else if (worldValues.survival_vs_self_expression < 0.3) {
      summary.push("Focuses on security and survival");
    }
  }

  // Moral foundations
  if (traits.moral_foundations) {
    const moral = traits.moral_foundations;
    const strongValues: string[] = [];
    
    if (moral.care > 0.7) strongValues.push("compassion");
    if (moral.fairness > 0.7) strongValues.push("fairness");
    if (moral.liberty > 0.7) strongValues.push("freedom");
    
    if (strongValues.length > 0) {
      summary.push(`Strong values: ${strongValues.join(", ")}`);
    }
  }

  return summary.join("\n");
}