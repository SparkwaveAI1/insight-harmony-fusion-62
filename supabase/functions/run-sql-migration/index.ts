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
      console.log('Fixing queue health functions and permissions...')

      // Fix get_queue_health_status function and permissions
      await connection.queryObject(`
        CREATE OR REPLACE FUNCTION public.get_queue_health_status()
        RETURNS TABLE(
          total_pending integer,
          total_processing integer,
          total_stuck integer,
          oldest_stuck_item text,
          processing_time_minutes integer
        )
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path TO 'public'
        AS $function$
          SELECT
            (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status = 'pending'),
            (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3')),
            (SELECT COUNT(*)::integer FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3') AND processing_started_at < NOW() - INTERVAL '10 minutes'),
            (SELECT name FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3') AND processing_started_at < NOW() - INTERVAL '10 minutes' ORDER BY processing_started_at ASC LIMIT 1),
            (SELECT EXTRACT(EPOCH FROM (NOW() - MIN(processing_started_at))) / 60 FROM persona_creation_queue WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3'))::integer;
        $function$;

        GRANT EXECUTE ON FUNCTION get_queue_health_status TO authenticated;
        GRANT EXECUTE ON FUNCTION get_queue_health_status TO anon;
      `)
      console.log('Fixed get_queue_health_status function')

      // Fix fix_orphaned_persona_queue_items function and permissions
      await connection.queryObject(`
        CREATE OR REPLACE FUNCTION public.fix_orphaned_persona_queue_items()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path TO 'public'
        AS $function$
        BEGIN
          -- Reset stuck processing items back to pending
          UPDATE persona_creation_queue
          SET status = 'pending',
              processing_started_at = NULL,
              locked_at = NULL,
              error_message = 'Reset: Orphaned processing state',
              updated_at = NOW()
          WHERE status IN ('processing', 'processing_stage1', 'processing_stage2', 'processing_stage3')
            AND processing_started_at < NOW() - INTERVAL '10 minutes';
        END;
        $function$;

        GRANT EXECUTE ON FUNCTION fix_orphaned_persona_queue_items TO authenticated;
        GRANT EXECUTE ON FUNCTION fix_orphaned_persona_queue_items TO anon;
      `)
      console.log('Fixed fix_orphaned_persona_queue_items function')

      // Fix pop_next_persona_queue function and permissions
      await connection.queryObject(`
        GRANT EXECUTE ON FUNCTION pop_next_persona_queue TO authenticated;
        GRANT EXECUTE ON FUNCTION pop_next_persona_queue TO anon;
      `)
      console.log('Fixed pop_next_persona_queue permissions')

      // Create admin function to get ALL queue items (bypasses RLS)
      await connection.queryObject(`
        CREATE OR REPLACE FUNCTION public.get_all_queue_items()
        RETURNS SETOF persona_creation_queue
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path TO 'public'
        AS $function$
          SELECT * FROM persona_creation_queue
          ORDER BY created_at DESC
          LIMIT 200;
        $function$;

        GRANT EXECUTE ON FUNCTION get_all_queue_items TO authenticated;
      `)
      console.log('Created get_all_queue_items function for admins')

      console.log('Now fixing search_personas_unified sorting...')

      // Drop ALL overloads using DO block with regprocedure
      await connection.queryObject(`
        DO $$
        DECLARE
          func_oid oid;
        BEGIN
          FOR func_oid IN
            SELECT p.oid
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = 'search_personas_unified'
          LOOP
            EXECUTE format('DROP FUNCTION %s', func_oid::regprocedure);
          END LOOP;
        END $$;
      `)
      console.log('Dropped all function overloads')

      // Now create the single clean version
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
          persona_id text,
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
            AND (p_states IS NULL OR p.state_region_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
            AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
            AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
            AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
            AND (p_income_brackets IS NULL OR p.income_bracket ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
            AND (p_education_levels IS NULL OR p.education_level ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
            AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
            AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
            AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
            AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
            AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
            AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
            AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
            AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold);

          RETURN QUERY
          SELECT
            p.persona_id::text,
            p.name::text,
            p.age_computed::int,
            p.gender_computed::text,
            p.ethnicity_computed::text,
            p.state_region_computed::text,
            p.city_computed::text,
            p.occupation_computed::text,
            p.income_bracket::text,
            p.education_level::text,
            p.has_children_computed::boolean,
            p.dependents_computed::int,
            p.political_lean_computed::text,
            p.profile_image_url::text,
            p.profile_thumbnail_url::text,
            p.interest_tags::text[],
            p.health_tags::text[],
            p.created_at::timestamptz,
            p.background::text,
            p.is_public::boolean,
            CASE WHEN p_semantic_embedding IS NOT NULL
              THEN (1 - (p.profile_embedding <=> p_semantic_embedding))::float
              ELSE NULL::float
            END AS semantic_score,
            v_total::bigint
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
            AND (p_states IS NULL OR p.state_region_computed ILIKE ANY(SELECT '%' || unnest(p_states) || '%'))
            AND (p_has_children IS NULL OR p.has_children_computed = p_has_children)
            AND (p_marital_statuses IS NULL OR p.marital_status_computed ILIKE ANY(SELECT '%' || unnest(p_marital_statuses) || '%'))
            AND (p_occupation_contains IS NULL OR p.occupation_computed ILIKE '%' || p_occupation_contains || '%')
            AND (p_income_brackets IS NULL OR p.income_bracket ILIKE ANY(SELECT '%' || unnest(p_income_brackets) || '%'))
            AND (p_education_levels IS NULL OR p.education_level ILIKE ANY(SELECT '%' || unnest(p_education_levels) || '%'))
            AND (p_interest_tags_any IS NULL OR p.interest_tags && p_interest_tags_any)
            AND (p_health_tags_any IS NULL OR p.health_tags && p_health_tags_any)
            AND (p_work_role_tags_any IS NULL OR p.work_role_tags && p_work_role_tags_any)
            AND (p_political_leans IS NULL OR p.political_lean_computed ILIKE ANY(SELECT '%' || unnest(p_political_leans) || '%'))
            AND (p_text_contains IS NULL OR p.background ILIKE '%' || p_text_contains || '%')
            AND (p_text_excludes IS NULL OR p.background NOT ILIKE '%' || p_text_excludes || '%')
            AND (p_name_contains IS NULL OR p.name ILIKE '%' || p_name_contains || '%')
            AND (p_semantic_embedding IS NULL OR (1 - (p.profile_embedding <=> p_semantic_embedding)) >= p_semantic_threshold)
          GROUP BY p.persona_id
          ORDER BY p.created_at DESC
          LIMIT p_limit
          OFFSET p_offset;
        END;
        $fn$
      `)
      console.log('Created new function')

      // Grant permissions
      await connection.queryObject(`
        GRANT EXECUTE ON FUNCTION search_personas_unified TO authenticated;
        GRANT EXECUTE ON FUNCTION search_personas_unified TO anon;
      `)
      console.log('Granted permissions')

      // Verify
      const result = await connection.queryObject<{ name: string; created_at: string }>(`
        SELECT name, created_at::text
        FROM v4_personas
        WHERE is_public = true
        ORDER BY created_at DESC
        LIMIT 5
      `)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Function recreated with created_at DESC sorting',
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
