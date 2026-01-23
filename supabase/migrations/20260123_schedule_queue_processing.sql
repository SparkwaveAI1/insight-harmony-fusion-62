-- Schedule automatic queue processing every 2 minutes
-- This calls the process-queue-item Edge Function which:
-- 1. Atomically pops the next pending queue item
-- 2. Creates the persona via v4-persona-unified
-- 3. Adds to collections if specified
-- 4. Updates queue status on completion

SELECT cron.schedule(
  'process-persona-queue-every-2min',
  '*/2 * * * *', -- Every 2 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wgerdrdsuusnrdnwwelt.supabase.co/functions/v1/process-queue-item',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
