import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

    console.log('Connecting to database...')
    const pool = new Pool(databaseUrl, 3, true)
    const connection = await pool.connect()

    try {
      console.log('Fixing search_personas_unified sorting...')

      // Update the function with fixed sorting - default to created_at DESC
      await connection.queryObject(`
        CREATE OR REPLACE FUNCTION search_personas_unified(
          p_limit int DEFAULT 50,
          p_offset int DEFAULT 0,
          p_public_only boolean DEFAULT true,
          p_user_id uuid DEFAULT NULL,
          p_collection_ids uuid[] DEFAULT NULL,
          p_age_min int DEFAULT NULL,
          p_age_max int DEFAULT NULL,
          p_genders text[] DEFAULT NULL,
          p_ethnicities text[] DEFAULT NULL,
          p_states text[] DEFAULT NULL,
          p_has_children boolean DEFAULT NULL,
          p_marital_statuses text[] DEFAULT NULL,
          p_occupation_contains text DEFAULT NULL,
          p_income_brackets text[] DEFAULT NULL,
          p_education_levels text[] DEFAULT NULL,
          p_interest_tags_any text[] DEFAULT NULL,
          p_health_tags_any text[] DEFAULT NULL,
          p_work_role_tags_any text[] DEFAULT NULL,
          p_political_leans text[] DEFAULT NULL,
          p_text_contains text DEFAULT NULL,
          p_text_excludes text DEFAULT NULL,
          p_name_contains text DEFAULT NULL,
          p_semantic_embedding vector(1536) DEFAULT NULL,
          p_semantic_threshold float DEFAULT 0.5,
          p_sort_by text DEFAULT 'created'
        )
        RETURNS TABLE (
          persona_id uuid,
          name text,
          age int,
          gender text,
          ethnicity text,
          state_region text,
          city text,
          occupation text,
          income_bracket text,
          education_level text,
          has_children boolean,
          dependents int,
          political_lean text,
          profile_image_url text,
          profile_thumbnail_url text,
          interest_tags text[],
          health_tags text[],
          created_at timestamptz,
          background text,
          is_public boolean,
          semantic_score float,
          total_count bigint
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $fn$
        DECLARE
          v_total bigint;
        BEGIN
          -- Count total matching personas
          SELECT COUNT(DISTINCT p.persona_id) INTO v_total
          FROM v4_personas p
          LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
          WHERE
            (NOT p_public_only OR p.is_public = true)
            AND (p_user_id IS NULL OR p.user_id = p_user_id)
            AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
            AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
            AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
            AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(SELECT '%' || unnest(p_genders) || '%'))
            AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(SELECT '%' || unnest(p_ethnicities) || '%'))
            AND (p_states IS NULL OR p.state_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
            AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
            AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
            AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
            AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
            AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
            AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
            AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
            AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
            AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
            AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
            AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
            AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
            AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold);

          -- Return results sorted by created_at DESC (most recent first) by default
          RETURN QUERY
          SELECT
            p.persona_id,
            p.name,
            p.age_computed,
            p.gender_computed,
            p.ethnicity_computed,
            p.state_computed,
            p.city_computed,
            p.occupation_computed,
            p.income_bracket_computed,
            p.education_level_computed,
            p.has_children_computed,
            p.dependents_computed,
            p.political_lean_computed,
            p.profile_image_url,
            p.profile_thumbnail_url,
            p.interest_tags,
            p.health_tags,
            p.created_at,
            p.background,
            p.is_public,
            CASE WHEN p_semantic_embedding IS NOT NULL
              THEN (1 - (p.profile_embedding <=> p_semantic_embedding))::float
              ELSE NULL
            END AS semantic_score,
            v_total
          FROM v4_personas p
          LEFT JOIN collection_personas cp ON cp.persona_id = p.persona_id
          WHERE
            (NOT p_public_only OR p.is_public = true)
            AND (p_user_id IS NULL OR p.user_id = p_user_id)
            AND (p_collection_ids IS NULL OR cp.collection_id = ANY(p_collection_ids))
            AND (p_age_min IS NULL OR p.age_computed >= p_age_min)
            AND (p_age_max IS NULL OR p.age_computed <= p_age_max)
            AND (p_genders IS NULL OR p.gender_computed ILIKE ANY(SELECT '%' || unnest(p_genders) || '%'))
            AND (p_ethnicities IS NULL OR p.ethnicity_computed ILIKE ANY(SELECT '%' || unnest(p_ethnicities) || '%'))
            AND (p_states IS NULL OR p.state_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
            AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
            AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
            AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
            AND (p_income_brackets IS NULL OR p.income_bracket_computed ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
            AND (p_education_levels IS NULL OR p.education_level_computed ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
            AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
            AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
            AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
            AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
            AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
            AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
            AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
            AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold)
          GROUP BY p.persona_id
          ORDER BY
            CASE WHEN p_sort_by = 'semantic' AND p_semantic_embedding IS NOT NULL
              THEN (1 - (p.profile_embedding <=> p_semantic_embedding))
              ELSE 0
            END DESC,
            CASE WHEN p_sort_by = 'name' THEN p.name END ASC,
            CASE WHEN p_sort_by = 'created' OR p_sort_by IS NULL OR p_sort_by = '' THEN p.created_at END DESC,
            p.created_at DESC
          LIMIT p_limit
          OFFSET p_offset;
        END;
        $fn$
      `)

      console.log('Function updated successfully')

      // Verify by checking the first few results
      const result = await connection.queryObject<{ name: string; created_at: string }>(`
        SELECT name, created_at::text FROM search_personas_unified(
          p_limit := 5,
          p_public_only := true,
          p_sort_by := 'created'
        )
      `)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Sorting fix applied! Function now defaults to created_at DESC',
          sample: result.rows
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } finally {
      connection.release()
      await pool.end()
    }
  } catch (error: any) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
