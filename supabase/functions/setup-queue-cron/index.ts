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
      // First enable pg_cron and pg_net extensions if not already enabled
      console.log('Ensuring extensions are enabled...')
      await connection.queryObject(`CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog`)
      await connection.queryObject(`CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions`)
      console.log('Extensions enabled')

      // First check if the job already exists
      const existingJob = await connection.queryObject(`
        SELECT jobname FROM cron.job WHERE jobname = 'process-persona-queue-every-2min'
      `)

      if (existingJob.rows.length > 0) {
        console.log('Cron job already exists, removing old one first...')
        await connection.queryObject(`
          SELECT cron.unschedule('process-persona-queue-every-2min')
        `)
      }

      console.log('Scheduling queue processing cron job...')
      await connection.queryObject(`
        SELECT cron.schedule(
          'process-persona-queue-every-2min',
          '*/2 * * * *',
          $$
          SELECT
            net.http_post(
                url:='https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/process-queue-item',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY"}'::jsonb,
                body:='{"trigger": "cron"}'::jsonb
            ) as request_id;
          $$
        )
      `)
      console.log('Cron job scheduled successfully')

      // Verify it was created
      const verifyJob = await connection.queryObject(`
        SELECT jobname, schedule FROM cron.job WHERE jobname = 'process-persona-queue-every-2min'
      `)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Queue processing cron job scheduled',
          job: verifyJob.rows[0]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } finally {
      connection.release()
      await pool.end()
    }
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
