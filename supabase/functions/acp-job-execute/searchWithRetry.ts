interface SearchAttempt {
  attempt_number: number;
  query: string;
  filters_applied: object;
  excluded_persona_ids: string[];
  excluded_states?: string[];
  personas_returned: number;
  personas_accepted: number;
  personas_rejected: {
    persona_id: string;
    name: string;
    reason: string;
  }[];
  duration_ms: number;
}

interface ValidationLog {
  job_id: string;
  original_query: string;
  requested_count: number;
  attempts: SearchAttempt[];
  final_result: {
    success: boolean;
    personas_selected: number;
    rejection_reason?: string;
  };
  total_duration_ms: number;
}

interface ValidationResult {
  compliant_personas: string[];
  rejected_personas: {
    persona_id: string;
    name: string;
    reason: string;
  }[];
}

function extractState(location: string): string | null {
  if (!location) return null;
  // Handle "City, State, Country" format
  const parts = location.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // Second to last is usually state
  }
  return null;
}

async function validatePersonaSelection(
  originalQuery: string,
  neededCount: number,
  newPersonas: any[],
  existingPersonas: any[],
  requiresUniqueStates: boolean,
  excludedStates: string[],
  openaiKey: string
): Promise<ValidationResult> {
  
  const personaSummaries = newPersonas.map(p => ({
    persona_id: p.persona_id,
    name: p.name,
    age: p.demographics?.age,
    gender: p.demographics?.gender,
    occupation: p.demographics?.occupation,
    location: p.demographics?.location,
    bmi: p.full_profile?.health_profile?.bmi,
    relationship_status: p.full_profile?.identity?.relationship_status,
    dependents: p.full_profile?.identity?.dependents,
    financial_stressors: p.full_profile?.money_profile?.financial_stressors,
    mental_health_flags: p.full_profile?.health_profile?.mental_health_flags,
    chronic_conditions: p.full_profile?.health_profile?.chronic_conditions
  }));

  const existingSummaries = existingPersonas.map(p => 
    `- ${p.name}: ${p.demographics?.occupation}, ${p.demographics?.location}`
  ).join('\n') || 'None yet';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You validate whether personas are suitable for a market research study.

YOUR TASK: Determine if each persona is a reasonable match for the research query. Think like a market researcher selecting participants.

VALIDATION APPROACH:
1. UNDERSTAND THE INTENT - What type of person is the researcher looking for? Don't be overly literal.
   - "people with anxiety" = anyone who experiences anxiety (mild, occasional, chronic - all count)
   - "overweight people" = BMI >= 25
   - "financially stressed" = anyone with money worries, debt issues, financial stressors
   - "parents with children" = anyone with dependents/children

2. LOCATION REQUIREMENTS - These must be exact:
   - If a specific state is required, the persona must be from that state
   - "California" must be California (not Georgia, not Texas)
   - For "different states" requirements, no two personas can share a state

3. DIVERSITY CHECK - For research quality:
   - Reject if two personas are nearly identical (same occupation + same age range + same location)
   - Different perspectives make better research

4. USE COMMON SENSE:
   - A persona with "mild anxiety" IS a person with anxiety
   - A persona with "financial stressors: [mortgage, medical bills]" IS financially stressed
   - A persona who is a "single mother with 2 kids" IS a parent with children
   - Don't reject based on technicalities - reject based on whether they fit the research intent

RESPOND WITH JSON:
{
  "compliant_personas": ["persona_id1", "persona_id2"],
  "rejected_personas": [
    {"persona_id": "xxx", "name": "Name", "reason": "Clear reason - e.g., 'From Texas, not California as required'"}
  ]
}

Only reject personas for clear mismatches, not technicalities.`
        },
        {
          role: 'user',
          content: `ORIGINAL QUERY: "${originalQuery}"
PERSONAS NEEDED: ${neededCount} more
${requiresUniqueStates ? `REQUIRES UNIQUE STATES - States already used (must NOT repeat): ${excludedStates.length > 0 ? excludedStates.join(', ') : 'None yet'}` : ''}

ALREADY ACCEPTED PERSONAS (for diversity check):
${existingSummaries}

NEW PERSONAS TO VALIDATE:
${JSON.stringify(personaSummaries, null, 2)}

For each persona, validate against ALL criteria in the original query. Be strict.`
        }
      ],
    }),
  });

  if (!response.ok) {
    console.error('Validation API failed:', await response.text());
    // On API failure, accept all to avoid blocking (log the issue)
    return {
      compliant_personas: newPersonas.map(p => p.persona_id),
      rejected_personas: []
    };
  }

  const result = await response.json();
  try {
    return JSON.parse(result.choices[0].message.content);
  } catch (e) {
    console.error('Failed to parse validation response:', result.choices[0].message.content);
    return {
      compliant_personas: newPersonas.map(p => p.persona_id),
      rejected_personas: []
    };
  }
}

export async function searchWithValidationAndRetry(
  originalQuery: string,
  requestedCount: number,
  jobId: string,
  supabase: any,
  openaiKey: string,
  maxRetries: number = 2
): Promise<{
  success: boolean;
  personas: any[];
  log: ValidationLog;
  rejection_reason?: string;
}> {
  
  const log: ValidationLog = {
    job_id: jobId,
    original_query: originalQuery,
    requested_count: requestedCount,
    attempts: [],
    final_result: { success: false, personas_selected: 0 },
    total_duration_ms: 0
  };
  
  const startTime = Date.now();
  const retainedPersonas: any[] = [];
  const excludedPersonaIds: string[] = [];
  const excludedStates: string[] = [];
  
  // Detect if query requires unique states
  const requiresUniqueStates = /different states|each from a different state|unique states|from different states/i.test(originalQuery);
  
  console.log(`[searchWithRetry] Starting for job ${jobId}, need ${requestedCount}, uniqueStates=${requiresUniqueStates}`);
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const needed = requestedCount - retainedPersonas.length;
    if (needed <= 0) break;
    
    const attemptStart = Date.now();
    console.log(`[searchWithRetry] Attempt ${attempt}: need ${needed} more personas`);
    
    // Build context for retry searches
    let additionalContext = '';
    if (attempt > 1) {
      additionalContext = `Need ${needed} more persona(s). `;
      if (excludedStates.length > 0 && requiresUniqueStates) {
        additionalContext += `Must NOT be from these states: ${excludedStates.join(', ')}. `;
      }
    }
    
    // Call smart-acp-search
    const { data: searchData, error: searchError } = await supabase.functions.invoke('smart-acp-search', {
      body: {
        research_query: originalQuery,
        persona_count: Math.min(needed + 3, 10), // Get extras for validation buffer
        exclude_persona_ids: excludedPersonaIds,
        exclude_states: requiresUniqueStates ? excludedStates : undefined,
        additional_context: additionalContext
      }
    });
    
    if (searchError) {
      console.error(`[searchWithRetry] Search error on attempt ${attempt}:`, searchError);
      log.attempts.push({
        attempt_number: attempt,
        query: originalQuery,
        filters_applied: {},
        excluded_persona_ids: [...excludedPersonaIds],
        excluded_states: requiresUniqueStates ? [...excludedStates] : undefined,
        personas_returned: 0,
        personas_accepted: 0,
        personas_rejected: [],
        duration_ms: Date.now() - attemptStart
      });
      continue;
    }
    
    const returnedPersonas = searchData?.personas || [];
    console.log(`[searchWithRetry] Attempt ${attempt}: search returned ${returnedPersonas.length} personas`);
    
    if (returnedPersonas.length === 0) {
      log.attempts.push({
        attempt_number: attempt,
        query: originalQuery,
        filters_applied: searchData?.parsed_criteria || {},
        excluded_persona_ids: [...excludedPersonaIds],
        excluded_states: requiresUniqueStates ? [...excludedStates] : undefined,
        personas_returned: 0,
        personas_accepted: 0,
        personas_rejected: [],
        duration_ms: Date.now() - attemptStart
      });
      continue;
    }
    
    // Validate returned personas with LLM
    const validation = await validatePersonaSelection(
      originalQuery,
      needed,
      returnedPersonas,
      retainedPersonas,
      requiresUniqueStates,
      excludedStates,
      openaiKey
    );
    
    console.log(`[searchWithRetry] Validation: ${validation.compliant_personas.length} accepted, ${validation.rejected_personas.length} rejected`);
    
    // Process validation results
    const accepted = returnedPersonas.filter(p => 
      validation.compliant_personas.includes(p.persona_id)
    );
    
    // Log this attempt
    log.attempts.push({
      attempt_number: attempt,
      query: originalQuery,
      filters_applied: searchData?.parsed_criteria || {},
      excluded_persona_ids: [...excludedPersonaIds],
      excluded_states: requiresUniqueStates ? [...excludedStates] : undefined,
      personas_returned: returnedPersonas.length,
      personas_accepted: accepted.length,
      personas_rejected: validation.rejected_personas,
      duration_ms: Date.now() - attemptStart
    });
    
    // Update retained set (only take what we need)
    for (const persona of accepted.slice(0, needed)) {
      retainedPersonas.push(persona);
      excludedPersonaIds.push(persona.persona_id);
      
      // Track states for diversity
      if (requiresUniqueStates) {
        const location = persona.demographics?.location || '';
        const state = extractState(location);
        if (state && !excludedStates.includes(state)) {
          excludedStates.push(state);
          console.log(`[searchWithRetry] Added state to exclusion: ${state}`);
        }
      }
    }
    
    console.log(`[searchWithRetry] After attempt ${attempt}: ${retainedPersonas.length}/${requestedCount} personas`);
    
    // If we got nothing new and have more retries, continue
    if (accepted.length === 0 && attempt < maxRetries + 1) {
      console.log(`[searchWithRetry] No new valid personas, will retry`);
    }
  }
  
  // Save log to database
  log.total_duration_ms = Date.now() - startTime;
  
  try {
    await supabase.from('acp_search_logs').insert({
      job_id: jobId,
      original_query: originalQuery,
      requested_count: requestedCount,
      attempts: log.attempts,
      final_success: retainedPersonas.length >= requestedCount,
      personas_selected: retainedPersonas.length,
      rejection_reason: retainedPersonas.length < requestedCount 
        ? `Found ${retainedPersonas.length} of ${requestedCount} after ${log.attempts.length} attempts`
        : null,
      total_duration_ms: log.total_duration_ms
    });
  } catch (e) {
    console.error('[searchWithRetry] Failed to save log:', e);
  }
  
  // Final result
  if (retainedPersonas.length >= requestedCount) {
    log.final_result = {
      success: true,
      personas_selected: retainedPersonas.length
    };
    return {
      success: true,
      personas: retainedPersonas.slice(0, requestedCount),
      log
    };
  } else {
    const lastAttempt = log.attempts[log.attempts.length - 1];
    const rejectionReasons = log.attempts
      .flatMap(a => a.personas_rejected)
      .map(r => r.reason)
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 3);
    
    const reason = `After ${log.attempts.length} search attempts, only found ${retainedPersonas.length} of ${requestedCount} personas that match "${originalQuery}". ` +
      (rejectionReasons.length > 0 ? `Rejection reasons: ${rejectionReasons.join('; ')}. ` : '') +
      `Please try broadening your criteria or reducing the number of personas.`;
    
    log.final_result = {
      success: false,
      personas_selected: retainedPersonas.length,
      rejection_reason: reason
    };
    
    return {
      success: false,
      personas: retainedPersonas,
      log,
      rejection_reason: reason
    };
  }
}