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
    // Get the database URL from environment
    const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

    console.log('Connecting to database...')

    // Create a connection pool
    const pool = new Pool(databaseUrl, 3, true)
    const connection = await pool.connect()

    try {
      console.log('Running migration...')

      // Drop the index first
      await connection.queryObject(`DROP INDEX IF EXISTS idx_v4_personas_political_lean`)
      console.log('Dropped index')

      // Drop the old column
      await connection.queryObject(`ALTER TABLE v4_personas DROP COLUMN IF EXISTS political_lean_computed`)
      console.log('Dropped old column')

      // Add the new column that reads from political_lean_v2
      await connection.queryObject(`
        ALTER TABLE v4_personas
        ADD COLUMN political_lean_computed text
        GENERATED ALWAYS AS (
          COALESCE(full_profile->>'political_lean_v2', 'unclassified')
        ) STORED
      `)
      console.log('Added new column')

      // Recreate the index
      await connection.queryObject(`CREATE INDEX idx_v4_personas_political_lean ON v4_personas(political_lean_computed)`)
      console.log('Created index')

      // Verify the migration by getting the distribution
      const result = await connection.queryObject<{ political_lean_computed: string; count: number }>(`
        SELECT political_lean_computed, COUNT(*) as count
        FROM v4_personas
        GROUP BY political_lean_computed
        ORDER BY count DESC
      `)

      const distribution: Record<string, number> = {}
      for (const row of result.rows) {
        distribution[row.political_lean_computed] = Number(row.count)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Migration completed successfully!',
          distribution
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } finally {
      connection.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
