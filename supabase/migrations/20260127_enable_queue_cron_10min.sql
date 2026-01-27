-- Re-enable queue processing cron at 10-minute intervals (with self-chaining safety net)
-- This provides a safety net for continuous processing that happens via self-chaining
-- The 10-minute interval catches any stuck items or chains that break

-- First, ensure any old schedules are removed
SELECT cron.unschedule('process-persona-queue-every-2min') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-persona-queue-every-2min'
);

SELECT cron.unschedule('process-persona-queue-every-5min') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-persona-queue-every-5min'
);

-- Schedule new cron job at 10-minute intervals
SELECT cron.schedule(
  'process-persona-queue-every-10min',
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/process-queue-item',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
