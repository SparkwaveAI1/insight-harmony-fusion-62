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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Need service role for bulk updates
      { global: { headers: { Authorization: authHeader } } }
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
    const batchSize = Math.min(body.batch_size ?? 50, 100); // Max 100 at a time
    const forceRegenerate = body.force_regenerate ?? false;

    console.log('[generate-embeddings] Starting batch of', batchSize);

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

    // Build searchable text for each persona
    const textsToEmbed = personas.map(p => {
      const summary = p.conversation_summary as Record<string, any> | null;
      const parts = [
        p.name,
        p.age_computed ? `${p.age_computed} years old` : '',
        p.gender_computed,
        p.occupation_computed,
        [p.city_computed, p.state_region_computed, p.country_computed].filter(Boolean).join(', '),
        (p.interest_tags as string[] | null)?.join(', ') ?? '',
        (p.health_tags as string[] | null)?.join(', ') ?? '',
        (p.work_role_tags as string[] | null)?.join(', ') ?? '',
        summary?.personality_summary ?? '',
        summary?.motivational_summary ?? '',
        summary?.character_description ?? '',
        summary?.demographics?.background_description ?? '',
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

    // Update personas with embeddings
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Update one at a time (Supabase doesn't support bulk upsert with vector type easily)
    for (let i = 0; i < personas.length; i++) {
      const persona = personas[i];
      const embedding = embeddings[i].embedding;
      
      const { error: updateError } = await supabase
        .from('v4_personas')
        .update({
          profile_embedding: JSON.stringify(embedding),
          embedding_updated_at: new Date().toISOString(),
        })
        .eq('persona_id', persona.persona_id);

      if (updateError) {
        errorCount++;
        errors.push(`${persona.persona_id}: ${updateError.message}`);
        console.error('[generate-embeddings] Update error for', persona.persona_id, updateError.message);
      } else {
        successCount++;
      }
    }

    console.log('[generate-embeddings] Updated', successCount, 'personas, errors:', errorCount);

    // Check how many still need embeddings
    const { count: remainingCount } = await supabase
      .from('v4_personas')
      .select('persona_id', { count: 'exact', head: true })
      .eq('creation_completed', true)
      .is('profile_embedding', null);

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
