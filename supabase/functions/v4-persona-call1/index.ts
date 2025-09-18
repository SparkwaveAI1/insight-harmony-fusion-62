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

// Retry logic for persona generation with multiple configurations
async function generatePersonaWithRetry(systemPrompt: string, userPrompt: string): Promise<any> {
  const configurations = [
    { model: "gpt-4o-mini", max_tokens: 12000, attempt: 1 },
    { model: "gpt-4o-mini", max_tokens: 16000, attempt: 2 },
    { model: "gpt-4o", max_tokens: 8000, attempt: 3 },  // More expensive but more reliable
  ];

  let lastError: Error | null = null;

  for (const config of configurations) {
    try {
      console.log(`Persona generation attempt ${config.attempt} with ${config.model} (${config.max_tokens} tokens)`);
      
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
            { role: "user", content: userPrompt }
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

    // Generate persona using retry logic with multiple configurations
    console.log('Starting V4 Call 1 - Persona generation with retry logic')
    console.log('User prompt:', user_prompt)

    const systemPrompt = `Generate a complete V4 persona that EXACTLY follows the new validation schema. Return ONLY valid JSON without any markdown formatting, explanations, or code blocks.

CRITICAL: The response must include ALL required fields and NEVER include any banned fields.

REQUIRED FIELDS (ALL MUST BE PRESENT):
- identity, daily_life, health_profile, relationships, money_profile
- motivation_profile, communication_style, humor_profile, truth_honesty_profile
- bias_profile, cognitive_profile, emotional_profile, attitude_narrative
- political_narrative, adoption_profile, prompt_shaping, sexuality_profile

BANNED FIELDS (NEVER INCLUDE):
- big_five, social_identity, inhibitor_profile, cultural_dimensions
- behavioral_economics, identity_salience, knowledge_profile, contradictions
- attitude_snapshot, political_signals, linguistic_signature, signature_phrases
- physical_profile

Generate the complete persona structure with all required fields populated realistically.

CRITICAL INSTRUCTIONS:
- Avoid midline values (0.5) - create distinctive personalities
- Ensure internal consistency across all traits
- Make each field realistic and specific
- Numbers must be between 0 and 1 where specified
- Arrays can be empty [] if appropriate
- Generate diverse, authentic personas
- Return ONLY the JSON object, no explanations or markdown`

    // Use retry logic to generate persona
    const generatedPersona = await generatePersonaWithRetry(systemPrompt, user_prompt)

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