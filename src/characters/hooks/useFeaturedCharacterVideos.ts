
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedCharacterVideo {
  id: string;
  character_id: string;
  name: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  character_type: 'historical' | 'creative';
  display_order: number;
  is_active: boolean;
}

export const useFeaturedCharacterVideos = () => {
  return useQuery({
    queryKey: ['featured-character-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_character_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching featured character videos:', error);
        throw error;
      }

      console.log('Fetched featured character videos from database:', data);
      return data as FeaturedCharacterVideo[];
    },
  });
};
