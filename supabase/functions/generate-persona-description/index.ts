import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona } = await req.json();

    if (!persona) {
      return new Response(
        JSON.stringify({ success: false, error: 'Persona data is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log('Generating description for persona:', persona.name);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Extract key traits for description generation
    const traits = persona.trait_profile || {};
    const metadata = persona.metadata || {};
    
    // Build trait summary for description
    const traitSummary = generateTraitSummary(traits, metadata);
    
    const prompt = `Generate a realistic, nuanced description (2-3 sentences, max 120 words) for this persona based on their traits and background:

Name: ${persona.name}
${traitSummary}

The description should:
- Accurately reflect their psychological traits, especially neuroticism and conscientiousness levels
- Include their struggles and challenges, not just positive qualities
- Be written in third person with authentic, human complexity
- Avoid overly optimistic language if traits suggest otherwise
- Show how their personality affects their daily life and relationships
- Sound realistic and grounded, acknowledging both strengths and difficulties

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

    if (!description) {
      throw new Error('No description generated from OpenAI');
    }

    console.log('Generated description:', description);

    return new Response(
      JSON.stringify({
        success: true,
        description: description
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating persona description:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate description' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

function generateTraitSummary(traits: any, metadata: any): string {
  const summary: string[] = [];

  // Demographics
  if (metadata.age) summary.push(`Age: ${metadata.age}`);
  if (metadata.occupation) summary.push(`Occupation: ${metadata.occupation}`);
  if (metadata.location) summary.push(`Location: ${metadata.location}`);

  // Big Five traits with more nuanced descriptions
  if (traits.big_five) {
    const bigFive = traits.big_five;
    const traitDescriptions: string[] = [];
    
    // Extraversion
    if (bigFive.extraversion > 0.7) traitDescriptions.push("highly social and outgoing");
    else if (bigFive.extraversion > 0.5) traitDescriptions.push("moderately social but selective");
    else if (bigFive.extraversion < 0.3) traitDescriptions.push("prefers solitude and quiet environments");
    
    // Conscientiousness with struggle implications
    if (bigFive.conscientiousness > 0.7) traitDescriptions.push("highly organized and disciplined");
    else if (bigFive.conscientiousness < 0.3) traitDescriptions.push("struggles with organization and follow-through");
    else if (bigFive.conscientiousness < 0.5) traitDescriptions.push("somewhat impulsive and disorganized");
    
    // Neuroticism with mental health implications
    if (bigFive.neuroticism > 0.7) traitDescriptions.push("prone to anxiety and emotional volatility");
    else if (bigFive.neuroticism > 0.5) traitDescriptions.push("experiences moderate stress and worry");
    else if (bigFive.neuroticism < 0.3) traitDescriptions.push("emotionally resilient and stable");
    
    // Agreeableness with relationship implications
    if (bigFive.agreeableness > 0.7) traitDescriptions.push("cooperative and trusting");
    else if (bigFive.agreeableness < 0.3) traitDescriptions.push("skeptical and often defensive in relationships");
    else if (bigFive.agreeableness < 0.5) traitDescriptions.push("somewhat guarded and competitive");
    
    // Openness
    if (bigFive.openness > 0.7) traitDescriptions.push("intellectually curious and creative");
    else if (bigFive.openness < 0.3) traitDescriptions.push("prefers routine and conventional approaches");
    
    if (traitDescriptions.length > 0) {
      summary.push(`Personality: ${traitDescriptions.join(", ")}`);
    }
  }

  // Add health struggles if present
  if (traits.health_profile) {
    const health = traits.health_profile;
    const struggles: string[] = [];
    
    if (health.mental_health && health.mental_health.length > 0) {
      const mentalHealth = health.mental_health.filter((h: string) => h !== "none");
      if (mentalHealth.length > 0) {
        struggles.push(`mental health challenges: ${mentalHealth.join(", ")}`);
      }
    }
    
    if (health.substance_use && health.substance_use.length > 0) {
      const substances = health.substance_use.filter((s: string) => s !== "none");
      if (substances.length > 0) {
        struggles.push(`substance use: ${substances.join(", ")}`);
      }
    }
    
    if (struggles.length > 0) {
      summary.push(`Challenges: ${struggles.join("; ")}`);
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