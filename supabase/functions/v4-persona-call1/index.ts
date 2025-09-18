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

    // Extract and validate inputs
    const userInputs = {
      role: requestBody.role || null,
      region: requestBody.region && requestBody.region !== 'any' ? requestBody.region : null,
      urbanicity: requestBody.urbanicity && requestBody.urbanicity !== 'any' ? requestBody.urbanicity : null,
      age_range: requestBody.age_range && requestBody.age_range !== 'any' ? requestBody.age_range : null,
      ethnicity: requestBody.ethnicity || null,
      income_bracket: requestBody.income_bracket || null,
      coherence_target: requestBody.coherence_target || 0.7,
      education_level: requestBody.education_level || null,
      relationship_status: requestBody.relationship_status || null,
      name_preference: requestBody.name_preference || null,
      gender: requestBody.gender || null
    };

    console.log('Processed user inputs:', userInputs);

    // Build enhanced user prompt that explicitly includes only user-specified fields
    const userPrompt = `Generate persona with these EXACT specifications:

${userInputs.role ? `Role/Occupation: ${userInputs.role}` : ''}
${(userInputs.region || userInputs.urbanicity) ? `Location: ${userInputs.region || 'unspecified'}${userInputs.urbanicity ? ` (${userInputs.urbanicity})` : ''}` : ''}
${userInputs.age_range ? `Age Range: ${userInputs.age_range}` : ''}
${userInputs.gender ? `GENDER (REQUIRED): ${userInputs.gender}` : ''}
${userInputs.name_preference ? `NAME (REQUIRED): ${userInputs.name_preference}` : ''}
${userInputs.ethnicity ? `ETHNICITY (REQUIRED): ${userInputs.ethnicity}` : ''}
${userInputs.income_bracket ? `Income Bracket: ${userInputs.income_bracket}` : ''}
${userInputs.education_level ? `Education Level: ${userInputs.education_level}` : ''}
${userInputs.relationship_status ? `Relationship Status: ${userInputs.relationship_status}` : ''}
Thought Coherence Target: ${userInputs.coherence_target}

CRITICAL REQUIREMENTS:
- If a field above is marked REQUIRED, use it EXACTLY as provided
- Place the role in identity.occupation when provided
- Match location details when provided
- Ensure age falls within the specified range when provided
- Include ALL required fields from the system prompt
- Make persona internally consistent

Generate complete persona with all 17 sections filled.`;

    const systemPrompt = `Generate a complete U.S. adult persona as valid JSON with ALL 17 required top-level sections. Every field listed below MUST be present and filled with realistic data.

REQUIRED TOP-LEVEL SECTIONS (all mandatory):
identity, daily_life, health_profile, relationships, money_profile, motivation_profile, communication_style, humor_profile, truth_honesty_profile, bias_profile, cognitive_profile, emotional_profile, attitude_narrative, political_narrative, adoption_profile, prompt_shaping, sexuality_profile

IDENTITY SECTION (all fields required):
{
  "identity": {
    "name": "[realistic first and last name]",
    "age": [18-100],
    "gender": "[male/female/non-binary]",
    "pronouns": "[appropriate pronouns]",
    "ethnicity": "[specific ethnicity - use provided ethnicity if specified]",
    "nationality": "[typically 'American']",
    "occupation": "[specific job title]",
    "relationship_status": "[single/married/divorced/partnered]",
    "dependents": [number],
    "education_level": "[High School/Bachelor's/Master's/PhD/etc]",
    "income_bracket": "[specific range like '40,000-60,000']",
    "location": {
      "city": "[specific city]",
      "region": "[state/region]",
      "country": "United States",
      "urbanicity": "[urban/suburban/rural]"
    }
  }
}

DAILY_LIFE SECTION (all fields required):
{
  "daily_life": {
    "primary_activities": {
      "work": [hours per day],
      "family_time": [hours per day],
      "personal_care": [hours per day],
      "personal_interests": [hours per day],
      "social_interaction": [hours per day]
    },
    "schedule_blocks": [
      {
        "start": "[time like '07:30']",
        "end": "[time like '17:00']",
        "activity": "[specific activity]",
        "setting": "[location]"
      }
    ],
    "time_sentiment": {
      "work": "[how they feel about work time]",
      "family": "[how they feel about family time]",
      "personal": "[how they feel about personal time]"
    },
    "screen_time_summary": "[detailed description of screen usage]",
    "mental_preoccupations": ["[worry 1]", "[worry 2]", "[worry 3]"]
  }
}

HEALTH_PROFILE SECTION (all fields required):
{
  "health_profile": {
    "bmi_category": "[normal/overweight/obese]",
    "chronic_conditions": ["[condition 1 if any]"],
    "mental_health_flags": ["[flag 1 if any]"],
    "medications": ["[medication 1 if any]"],
    "adherence_level": "[perfect/mostly_consistent/inconsistent]",
    "sleep_hours": [5-12],
    "substance_use": {
      "alcohol": "[none/casual/regular/heavy]",
      "cigarettes": "[none/occasional/regular]",
      "vaping": "[none/occasional/regular]",
      "marijuana": "[none/occasional/regular]"
    },
    "fitness_level": "[low/moderate/high]",
    "diet_pattern": "[standard/healthy/restrictive/mixed]"
  }
}

RELATIONSHIPS SECTION (all fields required):
{
  "relationships": {
    "household": {
      "status": "[matches relationship_status]",
      "harmony_level": "[peaceful/tense/conflicted]",
      "dependents": [matches identity dependents]
    },
    "caregiving_roles": ["[role 1 if any]"],
    "friend_network": {
      "size": "[small/medium/large]",
      "frequency": "[daily/weekly/monthly]",
      "anchor_contexts": ["[context 1]", "[context 2]"]
    },
    "pets": [{"type": "[animal]", "name": "[pet name]"}] OR []
  }
}

MONEY_PROFILE SECTION (all fields required):
{
  "money_profile": {
    "attitude_toward_money": "[detailed attitude]",
    "earning_context": "[how they earn money]",
    "spending_style": "[how they spend]",
    "savings_investing_habits": {
      "emergency_fund_months": [0-12],
      "retirement_contributions": "[description]",
      "investing_style": "[description]"
    },
    "debt_posture": "[debt situation]",
    "financial_stressors": ["[stressor 1]", "[stressor 2]"],
    "money_conflicts": "[any money-related conflicts]",
    "generosity_profile": "[giving habits]"
  }
}

MOTIVATION_PROFILE SECTION (all fields required):
{
  "motivation_profile": {
    "primary_motivation_labels": ["[motivation 1]", "[motivation 2]"],
    "deal_breakers": ["[deal breaker 1]", "[deal breaker 2]"],
    "primary_drivers": {
      "care": [0.0-1.0],
      "family": [0.0-1.0],
      "status": [0.0-1.0],
      "mastery": [0.0-1.0],
      "meaning": [0.0-1.0],
      "novelty": [0.0-1.0],
      "security": [0.0-1.0],
      "belonging": [0.0-1.0],
      "self_interest": [0.0-1.0]
    },
    "goal_orientation": {
      "strength": [0.0-1.0],
      "time_horizon": "[short/medium/long term]",
      "primary_goals": [
        {
          "goal": "[specific goal]",
          "intensity": [1-10],
          "timeframe": "[timeframe]"
        }
      ],
      "goal_flexibility": [0.0-1.0]
    },
    "want_vs_should_tension": {
      "major_conflicts": [
        {
          "want": "[what they want]",
          "should": "[what they think they should do]",
          "trigger_conditions": ["[trigger 1]"],
          "typical_resolution": "[how they usually resolve it]"
        }
      ],
      "default_resolution": "[their default approach]"
    }
  }
}

COMMUNICATION_STYLE SECTION (all fields required):
{
  "communication_style": {
    "regional_register": {
      "region": "[matches location region]",
      "urbanicity": "[matches location urbanicity]",
      "dialect_hints": ["[hint 1]", "[hint 2]"]
    },
    "voice_foundation": {
      "formality": "[formal/casual/mixed]",
      "directness": "[direct/diplomatic/indirect]",
      "pace_rhythm": "[fast/moderate/slow]",
      "positivity": "[optimistic/realistic/pessimistic]",
      "empathy_level": [0.0-1.0],
      "honesty_style": "[blunt/diplomatic/evasive]",
      "charisma_level": [0.0-1.0]
    },
    "style_markers": {
      "metaphor_domains": ["[domain 1]", "[domain 2]"],
      "aphorism_register": "[folksy/academic/none]",
      "storytelling_vs_bullets": [0.0-1.0],
      "humor_style": "[dry/playful/sarcastic/none]",
      "code_switching_contexts": ["[context 1]"]
    },
    "context_switches": {
      "work": {
        "formality": "[work formality level]",
        "directness": "[work directness level]"
      },
      "home": {
        "formality": "[home formality level]",
        "directness": "[home directness level]"
      },
      "online": {
        "formality": "[online formality level]",
        "directness": "[online directness level]"
      }
    },
    "authenticity_filters": {
      "avoid_registers": ["[register 1]", "[register 2]"],
      "embrace_registers": ["[register 1]", "[register 2]"],
      "personality_anchors": ["[anchor 1]", "[anchor 2]"]
    }
  }
}

ALL REMAINING SECTIONS MUST BE COMPLETE:
- humor_profile (frequency, style, boundaries, targets, use_cases)
- truth_honesty_profile (baseline_honesty, situational_variance, typical_distortions, red_lines, pressure_points, confession_style)
- bias_profile (cognitive biases with all 8 types, mitigations)
- cognitive_profile (verbal_fluency, abstract_reasoning, problem_solving_orientation, thought_coherence)
- emotional_profile (stress_responses, negative_triggers, positive_triggers, explosive_triggers, emotional_regulation)
- attitude_narrative (paragraph describing their worldview)
- political_narrative (paragraph describing their political views)
- adoption_profile (buyer_power, adoption_influence, risk_tolerance, change_friction, expected_objections, proof_points_needed)
- prompt_shaping (voice_foundation summary, style_markers summary, primary_motivations, deal_breakers, honesty_vector, bias_vector, context_switches, current_focus)
- sexuality_profile (orientation, expression_style, relationship_norms, boundaries, linguistic_influences)

BANNED FIELDS: big_five, social_identity, inhibitor_profile, cultural_dimensions, behavioral_economics, identity_salience, knowledge_profile, contradictions, attitude_snapshot, political_signals, linguistic_signature, signature_phrases, physical_profile

CRITICAL: Use the ethnicity specified in user input. Be internally consistent across all fields. All numeric values must be numbers, not strings.

Return ONLY the complete JSON object with all sections filled.`;

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
      personaData = validateAndFixPersonaData(personaData, userInputs);

      // Strictly preserve user-specified fields
      if (userInputs.name_preference) {
        personaData.identity.name = userInputs.name_preference;
      }

      if (userInputs.ethnicity && personaData.identity.ethnicity !== userInputs.ethnicity) {
        console.warn(`Ethnicity mismatch: expected ${userInputs.ethnicity}, got ${personaData.identity.ethnicity}`);
        personaData.identity.ethnicity = userInputs.ethnicity;
      }

      if (userInputs.role && personaData.identity.occupation !== userInputs.role) {
        console.warn(`Role mismatch: expected ${userInputs.role}, got ${personaData.identity.occupation}`);
        personaData.identity.occupation = userInputs.role;
      }

      if (userInputs.gender) {
        personaData.identity.gender = userInputs.gender;
        // Align pronouns with gender when possible
        const pronounMap: Record<string, string> = { male: 'he/him', female: 'she/her', 'non-binary': 'they/them' };
        personaData.identity.pronouns = pronounMap[userInputs.gender] || personaData.identity.pronouns;
      }

      if (userInputs.region || userInputs.urbanicity) {
        personaData.identity.location = personaData.identity.location || { city: '', region: '', country: 'United States', urbanicity: '' };
        if (userInputs.region) personaData.identity.location.region = userInputs.region;
        if (userInputs.urbanicity) personaData.identity.location.urbanicity = userInputs.urbanicity;
      }

      if (userInputs.age_range && typeof personaData.identity.age === 'number') {
        const range = String(userInputs.age_range);
        let min = 18, max = 90;
        if (range.includes('+')) {
          const base = parseInt(range);
          if (!Number.isNaN(base)) min = base;
        } else if (range.includes('-')) {
          const [a, b] = range.split('-').map((n: string) => parseInt(n.trim(), 10));
          if (!Number.isNaN(a) && !Number.isNaN(b)) { min = a; max = b; }
        }
        if (personaData.identity.age < min || personaData.identity.age > max) {
          personaData.identity.age = Math.round((min + max) / 2);
        }
      }

      console.log(`Validated persona with name: "${personaData.identity.name}", ethnicity: "${personaData.identity.ethnicity}"`);

    } catch (validationError) {
      console.error('Persona validation failed:', validationError);
      throw validationError;
    }

    // Normalize numeric values
    personaData = normalizePersonaData(personaData);

    // Calculate validation score (all required fields present and validated)
    const validationScore = 1.0;
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    return new Response(JSON.stringify({
      success: true,
      persona_data: personaData,
      user_inputs_preserved: {
        ethnicity: personaData.identity.ethnicity,
        occupation: personaData.identity.occupation,
        region: personaData.identity.location.region,
        urbanicity: personaData.identity.location.urbanicity
      },
      generation_info: {
        total_fields: Object.keys(personaData).length,
        has_required_fields: true,
        validation_passed: true
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
      details: 'Comprehensive validation failed - persona was incomplete'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function validateAndFixPersonaData(personaData: any, userInputs: any = {}): any {
  console.log('🔍 Starting comprehensive persona validation...');
  const errors: string[] = [];
  const fixes: string[] = [];

  // Validate all 17 top-level sections
  const requiredSections = [
    'identity', 'daily_life', 'health_profile', 'relationships', 'money_profile',
    'motivation_profile', 'communication_style', 'humor_profile', 'truth_honesty_profile',
    'bias_profile', 'cognitive_profile', 'emotional_profile', 'attitude_narrative',
    'political_narrative', 'adoption_profile', 'prompt_shaping', 'sexuality_profile'
  ];

  for (const section of requiredSections) {
    if (!personaData[section]) {
      errors.push(`Missing entire section: ${section}`);
    }
  }

  if (errors.length > 0) {
    console.error('❌ Missing top-level sections:', errors);
    throw new Error(`Persona generation failed - missing sections: ${errors.join(', ')}`);
  }

  // Validate IDENTITY section completely
  if (personaData.identity) {
    const identityFields = {
      'name': 'string',
      'age': 'number', 
      'gender': 'string',
      'pronouns': 'string',
      'ethnicity': 'string',
      'nationality': 'string',
      'occupation': 'string',
      'relationship_status': 'string',
      'dependents': 'number',
      'education_level': 'string',
      'income_bracket': 'string'
    };

    Object.entries(identityFields).forEach(([field, expectedType]) => {
      const value = personaData.identity[field];
      if (value === undefined || value === null) {
        errors.push(`Missing identity.${field}`);
      } else if (typeof value !== expectedType) {
        errors.push(`Invalid type for identity.${field}: expected ${expectedType}, got ${typeof value}`);
      }
    });

    // Special validation for location
    if (!personaData.identity.location || typeof personaData.identity.location !== 'object') {
      errors.push('Missing or invalid identity.location object');
    } else {
      const locationFields = ['city', 'region', 'country', 'urbanicity'];
      locationFields.forEach(field => {
        if (!personaData.identity.location[field]) {
          errors.push(`Missing identity.location.${field}`);
        }
      });
    }

    // Fix missing ethnicity from user input
    if (userInputs.ethnicity && (!personaData.identity.ethnicity || personaData.identity.ethnicity === 'unspecified')) {
      personaData.identity.ethnicity = userInputs.ethnicity;
      fixes.push(`Fixed ethnicity to user-specified: ${userInputs.ethnicity}`);
    }

    // Generate missing name if needed
    if (!personaData.identity.name || !personaData.identity.name.trim()) {
      const gender = personaData.identity.gender || 'person';
      const ethnicity = personaData.identity.ethnicity || '';
      
      const namesByGenderEthnicity = {
        'male': {
          'African American': ['Marcus', 'Jamal', 'Darius', 'Terrell', 'Andre'],
          'Hispanic': ['Carlos', 'Miguel', 'Diego', 'Luis', 'Rafael'],
          'Asian': ['David', 'Kevin', 'Michael', 'James', 'Daniel'],
          'default': ['James', 'Michael', 'Robert', 'David', 'William']
        },
        'female': {
          'African American': ['Jasmine', 'Kenya', 'Alicia', 'Tanya', 'Nicole'],
          'Hispanic': ['Maria', 'Sofia', 'Isabella', 'Carmen', 'Ana'],
          'Asian': ['Jennifer', 'Lisa', 'Amy', 'Grace', 'Michelle'],
          'default': ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth']
        }
      };

      const lastNamesByEthnicity = {
        'African American': ['Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Jackson', 'Thompson', 'White', 'Harris'],
        'Hispanic': ['Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez', 'Ramirez', 'Cruz'],
        'Asian': ['Chen', 'Kim', 'Lee', 'Wang', 'Singh', 'Patel', 'Nguyen', 'Liu', 'Zhang', 'Kumar'],
        'default': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
      };

      const genderKey = gender.toLowerCase().includes('female') ? 'female' : 'male';
      const ethnicityKey = Object.keys(namesByGenderEthnicity[genderKey]).find(key => 
        ethnicity.toLowerCase().includes(key.toLowerCase().split(' ')[0])
      ) || 'default';

      const firstNames = namesByGenderEthnicity[genderKey][ethnicityKey];
      const lastNames = lastNamesByEthnicity[ethnicityKey];

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      personaData.identity.name = `${firstName} ${lastName}`;
      fixes.push(`Generated culturally appropriate name: ${personaData.identity.name}`);
    }
  }

  // Validate DAILY_LIFE section
  if (personaData.daily_life) {
    if (!personaData.daily_life.primary_activities) {
      errors.push('Missing daily_life.primary_activities');
    } else {
      const activityTypes = ['work', 'family_time', 'personal_care', 'personal_interests', 'social_interaction'];
      activityTypes.forEach(type => {
        if (typeof personaData.daily_life.primary_activities[type] !== 'number') {
          errors.push(`Missing or invalid daily_life.primary_activities.${type}`);
        }
      });
    }

    const dailyLifeRequiredFields = ['schedule_blocks', 'time_sentiment', 'screen_time_summary', 'mental_preoccupations'];
    dailyLifeRequiredFields.forEach(field => {
      if (!personaData.daily_life[field]) {
        errors.push(`Missing daily_life.${field}`);
      }
    });
  }

  // Validate HEALTH_PROFILE section
  if (personaData.health_profile) {
    const healthRequiredFields = [
      'bmi_category', 'chronic_conditions', 'mental_health_flags', 'medications',
      'adherence_level', 'sleep_hours', 'substance_use', 'fitness_level', 'diet_pattern'
    ];
    
    healthRequiredFields.forEach(field => {
      if (personaData.health_profile[field] === undefined) {
        errors.push(`Missing health_profile.${field}`);
      }
    });

    if (personaData.health_profile.substance_use) {
      const substanceTypes = ['alcohol', 'cigarettes', 'vaping', 'marijuana'];
      substanceTypes.forEach(type => {
        if (!personaData.health_profile.substance_use[type]) {
          errors.push(`Missing health_profile.substance_use.${type}`);
        }
      });
    }
  }

  // Validate RELATIONSHIPS section
  if (personaData.relationships) {
    if (!personaData.relationships.household) {
      errors.push('Missing relationships.household');
    } else {
      const householdFields = ['status', 'harmony_level', 'dependents'];
      householdFields.forEach(field => {
        if (personaData.relationships.household[field] === undefined) {
          errors.push(`Missing relationships.household.${field}`);
        }
      });
    }

    const relationshipFields = ['caregiving_roles', 'friend_network', 'pets'];
    relationshipFields.forEach(field => {
      if (personaData.relationships[field] === undefined) {
        errors.push(`Missing relationships.${field}`);
      }
    });
  }

  // Validate MONEY_PROFILE section
  if (personaData.money_profile) {
    const moneyRequiredFields = [
      'attitude_toward_money', 'earning_context', 'spending_style', 'savings_investing_habits',
      'debt_posture', 'financial_stressors', 'money_conflicts', 'generosity_profile'
    ];
    
    moneyRequiredFields.forEach(field => {
      if (!personaData.money_profile[field]) {
        errors.push(`Missing money_profile.${field}`);
      }
    });
  }

  // Validate MOTIVATION_PROFILE section
  if (personaData.motivation_profile) {
    const motivationRequiredFields = ['primary_motivation_labels', 'deal_breakers', 'primary_drivers', 'goal_orientation', 'want_vs_should_tension'];
    motivationRequiredFields.forEach(field => {
      if (!personaData.motivation_profile[field]) {
        errors.push(`Missing motivation_profile.${field}`);
      }
    });

    if (personaData.motivation_profile.primary_drivers) {
      const driverTypes = ['care', 'family', 'status', 'mastery', 'meaning', 'novelty', 'security', 'belonging', 'self_interest'];
      driverTypes.forEach(driver => {
        const value = personaData.motivation_profile.primary_drivers[driver];
        if (typeof value !== 'number') {
          errors.push(`Missing or invalid motivation_profile.primary_drivers.${driver}`);
        }
      });
    }
  }

  // Validate all other required sections
  const textSections = ['attitude_narrative', 'political_narrative'];
  textSections.forEach(section => {
    if (!personaData[section] || typeof personaData[section] !== 'string' || !personaData[section].trim()) {
      errors.push(`Missing or empty ${section}`);
    }
  });

  console.log(`✅ Validation complete. Errors: ${errors.length}, Fixes: ${fixes.length}`);
  
  if (errors.length > 0) {
    console.error('❌ Validation failed:', errors);
    throw new Error(`Persona validation failed: ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? ' (and more)' : ''}`);
  }

  if (fixes.length > 0) {
    console.log('🔧 Applied fixes:', fixes);
  }

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