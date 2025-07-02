
-- Add Isabella to the featured character videos
INSERT INTO public.featured_character_videos (
  character_id,
  name,
  description,
  video_url,
  character_type,
  display_order,
  is_active
) VALUES (
  'b795b58e-19cb-426f-80b9-7899a1ebc3ff',
  'Isabella',
  'Isabella was born in 1790 in a small fishing village along the northeastern Brazilian coast. Raised amid the hardships of colonial exploitation, she learned fishing and farming from a young age, and now helps support her extended family.',
  'https://wgerdrdsuusnrdnwwelt.supabase.co/storage/v1/object/public/character-videos//Isabella%207.1.25v2%20(1).mp4',
  'historical',
  1,
  true
);

-- Add Rajiv Patel to the featured character videos
INSERT INTO public.featured_character_videos (
  character_id,
  name,
  description,
  video_url,
  character_type,
  display_order,
  is_active
) VALUES (
  'rajiv-patel',
  'Rajiv Patel',
  'Rajiv was born in 1645 into a Patidar family in rural Gujarat. Married in his late teens, as was customary, he now has four children and is deeply involved in both agricultural work and the social life of his extended family.',
  'https://wgerdrdsuusnrdnwwelt.supabase.co/storage/v1/object/public/character-videos/Rajiv%20Patel.mp4',
  'historical',
  2,
  true
);
