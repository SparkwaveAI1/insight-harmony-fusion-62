-- Fix security definer view issue by recreating personas_union with security_invoker=on
DROP VIEW IF EXISTS public.personas_union;

CREATE VIEW public.personas_union
WITH (security_invoker=on)
AS
SELECT 
    v4.persona_id AS id,
    'v4'::text AS source,
    v4.user_id,
    v4.is_public,
    v4.created_at,
    v4.name,
    v4.profile_image_url
FROM v4_personas v4
WHERE v4.creation_completed = true;