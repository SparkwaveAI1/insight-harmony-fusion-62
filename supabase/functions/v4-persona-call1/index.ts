import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const requestBody = await req.json();
    console.log('Received request:', JSON.stringify(requestBody, null, 2));

    const { 
      role = 'professional',
      region = 'California', 
      urbanicity = 'urban',
      age_range = '25-35',
      ethnicity,
      income_bracket,
      coherence_target = 0.7
    } = requestBody;

    const systemPrompt = `Generate a detailed U.S. adult persona as valid JSON with these exact 17 top-level keys:
identity, daily_life, health_profile, relationships, money_profile, motivation_profile, communication_style, humor_profile, truth_honesty_profile, bias_profile, cognitive_profile, emotional_profile, attitude_narrative, political_narrative, adoption_profile, prompt_shaping, sexuality_profile

CRITICAL: The identity object MUST include a realistic "name" field with first and last name.

BANNED keys (never include): big_five, social_identity, inhibitor_profile, cultural_dimensions, behavioral_economics, identity_salience, knowledge_profile, contradictions, attitude_snapshot, political_signals, linguistic_signature, signature_phrases, physical_profile

Requirements:
- identity.name MUST be present with realistic first and last name
- identity.education_level, identity.income_bracket, identity.location.urbanicity are required
- All numeric values 0-1 scale where applicable
- Realistic demographics (26% normal weight, 30% overweight, 44% obese)
- Internal consistency across all fields
- cognitive_profile.thought_coherence must be a number
- Natural language avoiding "As a [profession]" openings

Example identity structure:
{
  "identity": {
    "name": "Sarah Martinez",
    "age": 32,
    "gender": "female",
    "pronouns": "she/her",
    ...
  }
}

Return ONLY the JSON object, no markdown formatting.`;

    const userPrompt = `Role: ${role}
Region: ${region} (${urbanicity})
Age: ${age_range}
${ethnicity ? `Ethnicity: ${ethnicity}` : ''}
${income_bracket ? `Income: ${income_bracket}` : ''}
Coherence target: ${coherence_target}`;

    // Retry configurations
    const configurations = [
      { model: "gpt-4o-mini", max_tokens: 12000, attempt: 1 },
      { model: "gpt-4o-mini", max_tokens: 16000, attempt: 2 },
      { model: "gpt-4o", max_tokens: 8000, attempt: 3 },
    ];

    let lastError: Error | null = null;
    let personaData: any = null;

    for (const config of configurations) {
      try {
        console.log(`Attempt ${config.attempt}: ${config.model} with ${config.max_tokens} tokens`);
        
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
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const openaiResponse = await response.json();
        const rawContent = openaiResponse.choices[0].message.content;
        
        console.log(`Raw response length: ${rawContent?.length || 0} characters`);

        // Validate response completeness
        if (!rawContent) {
          throw new Error("Empty response from OpenAI");
        }

        if (!rawContent.trim().endsWith('}')) {
          throw new Error("Response appears truncated - doesn't end with closing brace");
        }

        // Check brace balance
        const openBraces = (rawContent.match(/\{/g) || []).length;
        const closeBraces = (rawContent.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          throw new Error(`Unbalanced JSON: ${openBraces} opening, ${closeBraces} closing braces`);
        }

        // Parse JSON
        try {
          personaData = JSON.parse(rawContent);
        } catch (parseError) {
          console.log('Direct parsing failed, trying extraction...');
          personaData = extractJSONFromMarkdown(rawContent);
        }

        // Validate structure
        if (!personaData || typeof personaData !== 'object') {
          throw new Error("Invalid persona data structure");
        }

        // Check required fields
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

        // Success!
        console.log(`✅ Successful generation on attempt ${config.attempt}`);
        break;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${config.attempt} failed:`, error.message);
        
        if (config.attempt < configurations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000 * config.attempt));
        }
      }
    }

    if (!personaData) {
      throw new Error(`All generation attempts failed. Last error: ${lastError?.message}`);
    }

    // Validate and fix the persona data
    try {
      personaData = validateAndFixPersonaData(personaData);
      
      // Double-check the name is still valid after processing
      if (!personaData.identity?.name || !personaData.identity.name.trim()) {
        throw new Error('Failed to ensure valid name in persona data');
      }
      
      console.log(`✅ Validated persona with name: "${personaData.identity.name}"`);
      
    } catch (validationError) {
      console.error('Persona validation failed:', validationError);
      throw validationError;
    }

    // Normalize numeric values
    personaData = normalizePersonaData(personaData);

    return new Response(JSON.stringify({
      success: true,
      persona_data: personaData,
      generation_info: {
        total_fields: Object.keys(personaData).length,
        has_required_fields: true
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check server logs for full error details'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function validateAndFixPersonaData(personaData: any): any {
  console.log('Validating persona data...');

  // Ensure identity.name exists and is valid
  if (!personaData.identity?.name || typeof personaData.identity.name !== 'string' || !personaData.identity.name.trim()) {
    console.warn('Missing or invalid identity.name, generating fallback...');
    
    // Generate name based on other fields
    const gender = personaData.identity?.gender || 'person';
    const ethnicity = personaData.identity?.ethnicity || '';
    const age = personaData.identity?.age || 30;
    
    // Simple name generation logic
    const maleNames = ['James', 'Michael', 'Robert', 'David', 'William', 'John', 'Richard', 'Joseph'];
    const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica'];
    const neutralNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    let firstName: string;
    if (gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('female')) {
      firstName = maleNames[Math.floor(Math.random() * maleNames.length)];
    } else if (gender.toLowerCase().includes('female')) {
      firstName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    } else {
      firstName = neutralNames[Math.floor(Math.random() * neutralNames.length)];
    }
    
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    personaData.identity.name = `${firstName} ${lastName}`;
    
    console.log(`Generated name: ${personaData.identity.name}`);
  }

  // Validate other critical fields
  const criticalFields = {
    'identity.education_level': personaData.identity?.education_level,
    'identity.income_bracket': personaData.identity?.income_bracket,
    'identity.location.urbanicity': personaData.identity?.location?.urbanicity,
    'cognitive_profile.thought_coherence': personaData.cognitive_profile?.thought_coherence
  };

  const missingCritical = [];
  for (const [path, value] of Object.entries(criticalFields)) {
    if (value === undefined || value === null) {
      missingCritical.push(path);
    }
  }

  if (missingCritical.length > 0) {
    console.error('Missing critical fields:', missingCritical);
    throw new Error(`Generated persona missing critical fields: ${missingCritical.join(', ')}`);
  }

  // Ensure numeric fields are actually numbers
  if (typeof personaData.cognitive_profile.thought_coherence !== 'number') {
    personaData.cognitive_profile.thought_coherence = 0.7; // Safe default
  }

  // Validate motivation drivers are numbers
  if (personaData.motivation_profile?.primary_drivers) {
    const drivers = personaData.motivation_profile.primary_drivers;
    const driverKeys = ['care', 'family', 'status', 'mastery', 'meaning', 'novelty', 'security', 'belonging', 'self_interest'];
    
    driverKeys.forEach(key => {
      if (typeof drivers[key] !== 'number') {
        drivers[key] = 0.5; // Safe default
        console.warn(`Fixed invalid driver value for ${key}`);
      }
    });
  }

  console.log('✅ Persona data validation complete');
  return personaData;
}

function extractJSONFromMarkdown(content: string): any {
  let cleaned = content.replace(/```json\s*|\s*```/g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error("No valid JSON structure found in response");
  }
  
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    const fixed = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    
    return JSON.parse(fixed);
  }
}

function normalizePersonaData(data: any): any {
  // Clamp numeric values to 0-1 range
  function clampValue(value: any): number {
    if (typeof value !== 'number') return 0.5;
    return Math.max(0, Math.min(1, value));
  }

  // Ensure sexuality_profile exists
  if (!data.sexuality_profile) {
    data.sexuality_profile = {
      orientation: "unspecified",
      expression_style: "private",
      relationship_norms: "monogamous",
      boundaries: {
        comfort_level: "moderate",
        topics_off_limits: []
      },
      linguistic_influences: {
        flirtation_style: "none",
        humor_boundaries: "clean",
        taboo_navigation: "navigate_carefully"
      }
    };
  }

  // Clamp motivation drivers
  if (data.motivation_profile?.primary_drivers) {
    Object.keys(data.motivation_profile.primary_drivers).forEach(key => {
      data.motivation_profile.primary_drivers[key] = clampValue(data.motivation_profile.primary_drivers[key]);
    });
  }

  // Clamp cognitive values
  if (data.cognitive_profile) {
    ['verbal_fluency', 'abstract_reasoning', 'thought_coherence'].forEach(field => {
      if (data.cognitive_profile[field] !== undefined) {
        data.cognitive_profile[field] = clampValue(data.cognitive_profile[field]);
      }
    });
  }

  return data;
}