import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  persona_ids?: string[];  // Specific personas to embed
  batch_size?: number;     // How many to process (default 50)
  force_regenerate?: boolean; // Re-embed even if already has embedding
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Service role client - bypasses RLS for bulk updates
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: isAdmin } = await anonClient.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    const body: RequestBody = await req.json();
    const batchSize = Math.min(body.batch_size ?? 20, 50); // Smaller default, max 50 for reliability
    const forceRegenerate = body.force_regenerate ?? false;
    const batchStartTime = new Date().toISOString(); // Track when this batch started for force-regenerate

    console.log('[generate-embeddings] Starting batch of', batchSize, 'force_regenerate:', forceRegenerate);

    // Fetch personas that need embeddings
    let query = supabase
      .from('v4_personas')
      .select(`
        persona_id,
        name,
        age_computed,
        gender_computed,
        occupation_computed,
        city_computed,
        state_region_computed,
        country_computed,
        conversation_summary,
        full_profile,
        interest_tags,
        health_tags,
        work_role_tags
      `)
      .eq('creation_completed', true);

    if (body.persona_ids?.length) {
      query = query.in('persona_id', body.persona_ids);
    } else if (!forceRegenerate) {
      query = query.is('profile_embedding', null);
    }

    // Order by embedding age: nulls first (new personas), then oldest embeddings
    // This ensures each batch progresses through all personas deterministically
    query = query.order('embedding_updated_at', { ascending: true, nullsFirst: true });
    query = query.limit(batchSize);

    const { data: personas, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!personas || personas.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No personas need embedding',
          processed: 0,
          duration_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-embeddings] Processing', personas.length, 'personas');

    // Build comprehensive searchable text for each persona
    const textsToEmbed = personas.map(p => {
      const summary = p.conversation_summary as Record<string, any> | null;
      const fp = p.full_profile as Record<string, any> | null;
      
      const parts = [
        // Core demographics
        p.name,
        p.age_computed ? `${p.age_computed} years old` : '',
        p.gender_computed,
        p.occupation_computed,
        [p.city_computed, p.state_region_computed, p.country_computed].filter(Boolean).join(', '),

        // Tags (already indexed)
        (p.interest_tags as string[] | null)?.join(', ') ?? '',
        (p.health_tags as string[] | null)?.join(', ') ?? '',
        (p.work_role_tags as string[] | null)?.join(', ') ?? '',

        // From conversation_summary
        summary?.personality_summary ?? '',
        summary?.motivational_summary ?? '',
        summary?.character_description ?? '',
        summary?.physical_description ?? '',
        summary?.demographics?.background_description ?? '',

        // From full_profile - narratives
        fp?.attitude_narrative ?? '',
        fp?.political_narrative ?? '',

        // From full_profile - identity
        fp?.identity?.ethnicity ?? '',
        fp?.identity?.education_level ?? '',
        fp?.identity?.income_bracket ?? '',
        fp?.identity?.relationship_status ?? '',
        fp?.identity?.occupation ?? '',
        
        // Identity - additional fields (dependents, urbanicity)
        fp?.identity?.dependents ? `${fp.identity.dependents} dependents children` : '',
        fp?.identity?.location?.urbanicity ?? '',

        // Computed relationship status terms for better semantic matching
        (() => {
          const status = fp?.identity?.relationship_status?.toLowerCase();
          if (!status) return '';
          if (status.includes('divorced')) return 'divorced separated single parent';
          if (status.includes('widow')) return 'widowed widow widower single';
          if (status.includes('married')) return 'married spouse partner';
          if (status.includes('single')) return 'single unmarried';
          return status;
        })(),

        // Computed parenting terms for semantic matching
        (() => {
          const deps = fp?.identity?.dependents || fp?.relationships?.household?.dependents;
          if (deps === undefined || deps === null) return '';
          if (deps === 0) return 'no children childless';
          if (deps === 1) return 'parent one child single child';
          return `parent ${deps} children multiple children`;
        })(),

        // From full_profile - health (with computed weight category for semantic matching)
        fp?.health_profile?.bmi ? `BMI ${fp.health_profile.bmi}` : '',
        fp?.health_profile?.bmi_category ?? '',
        // Computed weight category for natural language matching
        (() => {
          const bmi = parseFloat(fp?.health_profile?.bmi);
          if (isNaN(bmi)) return '';
          if (bmi >= 35) return 'severely obese morbidly obese very overweight extremely heavy';
          if (bmi >= 30) return 'obese obesity overweight heavy high body weight';
          if (bmi >= 25) return 'overweight heavier above average weight';
          if (bmi < 18.5) return 'underweight thin skinny low body weight';
          return 'normal weight healthy weight average build';
        })(),
        fp?.health_profile?.fitness_level ?? '',
        fp?.health_profile?.diet_pattern ?? '',
        Array.isArray(fp?.health_profile?.chronic_conditions) 
          ? fp.health_profile.chronic_conditions.join(', ') : '',
        Array.isArray(fp?.health_profile?.mental_health_flags) 
          ? fp.health_profile.mental_health_flags.join(', ') : '',
        fp?.health_profile?.substance_use ? JSON.stringify(fp.health_profile.substance_use) : '',

        // From full_profile - physical
        fp?.physical_profile?.body_type ?? '',
        fp?.physical_profile?.appearance_description ?? '',

        // From full_profile - relationships (expanded)
        fp?.relationships?.household?.status ?? '',
        fp?.relationships?.household?.harmony_level ?? '',
        fp?.relationships?.household?.dependents ? `${fp.relationships.household.dependents} children dependents` : '',
        Array.isArray(fp?.relationships?.caregiving_roles)
          ? fp.relationships.caregiving_roles.join(', ') : '',
        Array.isArray(fp?.relationships?.pets) 
          ? fp.relationships.pets.join(', ') + ' pet owner' : '',

        // From full_profile - money (expanded)
        fp?.money_profile?.income_bracket ?? '',
        fp?.money_profile?.financial_situation ?? '',
        fp?.money_profile?.spending_style ?? '',
        fp?.money_profile?.attitude_toward_money ?? '',
        fp?.money_profile?.debt_posture ?? '',
        fp?.money_profile?.earning_context ?? '',
        Array.isArray(fp?.money_profile?.financial_stressors) 
          ? 'financial stress: ' + fp.money_profile.financial_stressors.join(', ') : '',
        fp?.money_profile?.money_conflicts ?? '',

        // Investment style - CRITICAL for finding investors by behavior
        fp?.money_profile?.savings_investing_habits?.investing_style ?? '',

        // Social circles - CRITICAL for finding community involvement
        Array.isArray(fp?.relationships?.friend_network?.anchor_contexts)
          ? 'social circles: ' + fp.relationships.friend_network.anchor_contexts.join(', ') 
          : '',

        // Attitude narrative - rich text about persona's mindset
        fp?.attitude_narrative ?? '',

        // Political narrative - political leanings in natural language  
        fp?.political_narrative ?? '',

        // Proof points - what convinces this persona to act
        Array.isArray(fp?.adoption_profile?.proof_points_needed)
          ? 'convinced by: ' + fp.adoption_profile.proof_points_needed.join(', ') 
          : '',

        // From full_profile - daily life (mental preoccupations)
        Array.isArray(fp?.daily_life?.mental_preoccupations)
          ? fp.daily_life.mental_preoccupations.join(', ') : '',
        fp?.daily_life?.time_sentiment ? JSON.stringify(fp.daily_life.time_sentiment) : '',

        // From full_profile - emotional profile
        Array.isArray(fp?.emotional_profile?.stress_responses)
          ? 'stress response: ' + fp.emotional_profile.stress_responses.join(', ') : '',
        Array.isArray(fp?.emotional_profile?.negative_triggers)
          ? 'triggered by: ' + fp.emotional_profile.negative_triggers.join(', ') : '',
        Array.isArray(fp?.emotional_profile?.positive_triggers)
          ? 'enjoys: ' + fp.emotional_profile.positive_triggers.join(', ') : '',
        fp?.emotional_profile?.emotional_regulation ?? '',

        // From full_profile - motivation
        Array.isArray(fp?.motivation_profile?.primary_motivation_labels)
          ? fp.motivation_profile.primary_motivation_labels.join(', ') : '',
        Array.isArray(fp?.motivation_profile?.deal_breakers)
          ? 'deal breakers: ' + fp.motivation_profile.deal_breakers.join(', ') : '',
        Array.isArray(fp?.motivation_profile?.primary_goals)
          ? 'goals: ' + fp.motivation_profile.primary_goals.join(', ') : '',

        // From full_profile - adoption/risk profile
        (() => {
          const risk = fp?.adoption_profile?.risk_tolerance;
          if (risk === undefined || risk === null) return '';
          if (risk >= 0.7) return 'risk-taker high risk tolerance adventurous bold';
          if (risk <= 0.3) return 'risk-averse cautious conservative low risk tolerance';
          return 'moderate risk tolerance';
        })(),
        Array.isArray(fp?.adoption_profile?.expected_objections)
          ? 'objections: ' + fp.adoption_profile.expected_objections.join(', ') : '',

        // Communication style
        fp?.communication_style?.voice_foundation?.formality ?? '',
        fp?.communication_style?.voice_foundation?.directness ?? '',
        fp?.communication_style?.voice_foundation?.positivity ?? '',
        Array.isArray(fp?.communication_style?.style_markers?.humor_style)
          ? fp.communication_style.style_markers.humor_style.join(', ') : '',
      ];
      
      return parts.filter(Boolean).join(' ').slice(0, 8000); // OpenAI limit safety
    });

    // Call OpenAI embedding API
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('[generate-embeddings] Calling OpenAI embeddings API');

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: textsToEmbed,
      }),
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error('[generate-embeddings] OpenAI API error:', errText);
      throw new Error(`OpenAI API error: ${errText}`);
    }

    const embeddingResult = await embeddingResponse.json();
    const embeddings = embeddingResult.data;

    console.log('[generate-embeddings] Got', embeddings.length, 'embeddings');

    // Update personas with embeddings using parallel updates for speed
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const CONCURRENT_UPDATES = 5;

    console.log('[generate-embeddings] Starting parallel updates, concurrency:', CONCURRENT_UPDATES);
    const updateStartTime = Date.now();

    for (let i = 0; i < personas.length; i += CONCURRENT_UPDATES) {
      const batch = personas.slice(i, i + CONCURRENT_UPDATES);
      const updatePromises = batch.map((persona, idx) => {
        const embedding = embeddings[i + idx].embedding;
        return supabase
          .from('v4_personas')
          .update({
            profile_embedding: JSON.stringify(embedding),
            embedding_updated_at: new Date().toISOString(),
          })
          .eq('persona_id', persona.persona_id)
          .then(({ error }) => ({ persona_id: persona.persona_id, error }));
      });

      const results = await Promise.allSettled(updatePromises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.error) {
            errorCount++;
            errors.push(`${result.value.persona_id}: ${result.value.error.message}`);
            console.error('[generate-embeddings] Update error:', result.value.persona_id, result.value.error.message);
          } else {
            successCount++;
          }
        } else {
          errorCount++;
          errors.push(`Promise rejected: ${result.reason}`);
        }
      }
    }

    console.log('[generate-embeddings] Updates completed in', Date.now() - updateStartTime, 'ms');

    console.log('[generate-embeddings] Updated', successCount, 'personas, errors:', errorCount);

    // Check how many still need embeddings
    let remainingCount = 0;
    
    if (forceRegenerate) {
      // When force regenerating, count personas with old embeddings (from before this batch started)
      const { count } = await supabase
        .from('v4_personas')
        .select('persona_id', { count: 'exact', head: true })
        .eq('creation_completed', true)
        .lt('embedding_updated_at', batchStartTime);
      remainingCount = count ?? 0;
    } else {
      // Normal mode: count personas without any embedding
      const { count } = await supabase
        .from('v4_personas')
        .select('persona_id', { count: 'exact', head: true })
        .eq('creation_completed', true)
        .is('profile_embedding', null);
      remainingCount = count ?? 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount,
        errors: errorCount,
        error_details: errors.length > 0 ? errors.slice(0, 5) : undefined,
        remaining: remainingCount ?? 0,
        duration_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-embeddings] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
