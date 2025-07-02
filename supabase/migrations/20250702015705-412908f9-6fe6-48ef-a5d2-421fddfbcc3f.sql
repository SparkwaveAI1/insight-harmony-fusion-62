
-- Add Rho Enaris to the featured character videos
INSERT INTO public.featured_character_videos (
  character_id,
  name,
  description,
  video_url,
  character_type,
  display_order,
  is_active
) VALUES (
  'rho-enaris',
  'Rho Enaris',
  'Rho Enaris was born within the Ark Vessel Ioth, a generational ship designed for long journeys among the stars.',
  'https://wgerdrdsuusnrdnwwelt.supabase.co/storage/v1/object/public/character-videos//Rho%20vid.mp4',
  'creative',
  3,
  true
);
