import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation system integration
const PERSONA_SCHEMA = {
  type: "object",
  required: [
    "identity", "daily_life", "health_profile", "relationships", "money_profile",
    "motivation_profile", "communication_style", "humor_profile", "truth_honesty_profile",
    "bias_profile", "cognitive_profile", "emotional_profile", "attitude_narrative",
    "political_narrative", "adoption_profile", "prompt_shaping", "sexuality_profile"
  ],
  additionalProperties: false
};

const BANNED_KEYS = [
  'big_five', 'social_identity', 'inhibitor_profile', 'cultural_dimensions', 
  'behavioral_economics', 'identity_salience', 'knowledge_profile', 'contradictions',
  'attitude_snapshot', 'political_signals', 'linguistic_signature', 'signature_phrases',
  'physical_profile'
];

function validatePersona(persona: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  function checkForBannedKeys(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (BANNED_KEYS.includes(key)) {
        errors.push(`Banned key found: ${currentPath}`);
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkForBannedKeys(value, currentPath);
      }
    }
  }

  checkForBannedKeys(persona);

  for (const field of PERSONA_SCHEMA.required) {
    if (!persona[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Improved JSON extraction function with error recovery
function extractJSONFromMarkdown(content: string): any {
  // Remove markdown code blocks
  let cleaned = content.replace(/```json\s*|\s*```/g, '');
  
  // Find the first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error("No valid JSON structure found in response");
  }
  
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    // Last resort: try to fix common JSON issues
    const fixed = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');  // Quote unquoted keys
    
    return JSON.parse(fixed);
  }
}

// Optimized system prompt that reduces token consumption
function buildOptimizedSystemPrompt(): string {
  return `Generate a detailed U.S. adult persona as valid JSON with these exact 17 top-level keys:
identity, daily_life, health_profile, relationships, money_profile, motivation_profile, communication_style, humor_profile, truth_honesty_profile, bias_profile, cognitive_profile, emotional_profile, attitude_narrative, political_narrative, adoption_profile, prompt_shaping, sexuality_profile

BANNED keys (never include): big_five, social_identity, inhibitor_profile, cultural_dimensions, behavioral_economics, identity_salience, knowledge_profile, contradictions, attitude_snapshot, political_signals, linguistic_signature, signature_phrases, physical_profile

Requirements:
- All numeric values 0-1 scale where applicable
- realistic demographics (26% normal weight, 30% overweight, 44% obese)
- Internal consistency across all fields
- Natural language avoiding "As a [profession]" openings
- Regional dialect hints in communication_style

Critical fields that MUST be present:
- identity.education_level, identity.income_bracket, identity.location.urbanicity
- cognitive_profile.thought_coherence (number)
- All motivation_profile.primary_drivers as numbers 0-1
- sexuality_profile with safe defaults

Return ONLY the JSON object, no markdown formatting.`;
}

// Build optimized user prompt from parameters
function buildOptimizedUserPrompt(userPrompt: string): string {
  // Try to parse structured parameters from user prompt, fallback to direct use
  try {
    // If user provided structured data, use it
    const structured = JSON.parse(userPrompt);
    return `Role: ${structured.role || 'working professional'}
Region: ${structured.region || 'United States'} (${structured.urbanicity || 'suburban'})
Age: ${structured.ageRange || '25-45'}
${structured.ethnicity ? `Ethnicity: ${structured.ethnicity}` : ''}
${structured.incomeBracket ? `Income: ${structured.incomeBracket}` : ''}
Coherence target: ${structured.coherenceTarget || 0.7}`;
  } catch {
    // If not structured JSON, create a simplified prompt from the text
    return `Generate a persona based on: ${userPrompt}`;
  }
}
// Retry logic for persona generation with multiple configurations
async function generatePersonaWithRetry(userPrompt: string): Promise<any> {
  const configurations = [
    { model: "gpt-4o-mini", max_tokens: 8000, attempt: 1 },   // Reduced from 12K due to optimized prompt
    { model: "gpt-4o-mini", max_tokens: 10000, attempt: 2 },  // Reduced from 16K
    { model: "gpt-4o", max_tokens: 6000, attempt: 3 },        // Reduced from 8K
  ];

  let lastError: Error | null = null;

  for (const config of configurations) {
    try {
      console.log(`Persona generation attempt ${config.attempt} with ${config.model} (${config.max_tokens} tokens)`);
      
      // Use optimized prompts
      const systemPrompt = buildOptimizedSystemPrompt();
      const optimizedUserPrompt = buildOptimizedUserPrompt(userPrompt);
      
      console.log(`System prompt length: ${systemPrompt.length} chars`);
      console.log(`User prompt: ${optimizedUserPrompt}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: optimizedUserPrompt }
          ],
          temperature: 0.7,
          max_tokens: config.max_tokens,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const responseData = await response.json();
      const rawContent = responseData.choices[0].message.content;
      console.log(`Raw response length: ${rawContent?.length || 0} characters`);

      // Validate response looks complete before parsing
      if (!rawContent) {
        throw new Error("Empty response from OpenAI");
      }

      if (!rawContent.trim().endsWith('}')) {
        throw new Error("Response appears truncated - doesn't end with closing brace");
      }

      // Count opening and closing braces to check for balance
      const openBraces = (rawContent.match(/\{/g) || []).length;
      const closeBraces = (rawContent.match(/\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        throw new Error(`Unbalanced JSON: ${openBraces} opening braces, ${closeBraces} closing braces`);
      }

      // Try to parse the JSON
      let personaData;
      try {
        personaData = JSON.parse(rawContent);
      } catch (parseError) {
        // Try to extract JSON from markdown if direct parsing fails
        personaData = extractJSONFromMarkdown(rawContent);
      }

      // Validate the parsed data has required structure
      if (!personaData || typeof personaData !== 'object') {
        throw new Error("Invalid persona data structure");
      }

      // Check for required top-level fields
      const requiredFields = [
        "identity", "daily_life", "health_profile", "relationships", "money_profile",
        "motivation_profile", "communication_style", "humor_profile", "truth_honesty_profile",
        "bias_profile", "cognitive_profile", "emotional_profile", "attitude_narrative",
        "political_narrative", "adoption_profile", "prompt_shaping", "sexuality_profile"
      ];

      const missingFields = requiredFields.filter(field => !personaData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log(`✅ Successful persona generation on attempt ${config.attempt}`);
      return personaData;

    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${config.attempt} failed:`, error.message);
      
      // Wait before next attempt
      if (config.attempt < configurations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000 * config.attempt));
      }
    }
  }

  // All attempts failed
  throw new Error(`All persona generation attempts failed. Last error: ${lastError?.message}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_prompt, user_id } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }

    // Generate persona using retry logic with optimized prompts
    console.log('Starting V4 Call 1 - Persona generation with optimized prompts')
    console.log('User prompt:', user_prompt)

    // Use retry logic to generate persona with optimized prompts
    const generatedPersona = await generatePersonaWithRetry(user_prompt)

    // Validate the generated persona
    console.log('Validating generated persona...')
    const validation = validatePersona(generatedPersona)
    
    if (!validation.isValid) {
      console.error('Generated persona failed validation:', validation.errors)
      throw new Error(`Generated persona is invalid: ${validation.errors.join(', ')}`)
    }
    
    console.log('✅ Generated persona passed validation')
    if (validation.warnings.length > 0) {
      console.log('⚠️ Validation warnings:', validation.warnings)
    }

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const persona_id = `v4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase
      .from('v4_personas')
      .insert([
        {
          persona_id,
          name: generatedPersona.identity.name,
          user_id: user_id,
          full_profile: generatedPersona,
          conversation_summary: {}, // Empty for now
          creation_stage: 'detailed_traits',
          creation_completed: false
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Persona stored successfully:', data[0].id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        persona_id: data[0].persona_id,
        persona_name: data[0].name,
        stage: 'detailed_traits_complete'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in v4-persona-call1:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})