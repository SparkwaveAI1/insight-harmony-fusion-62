
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
      // First check if we have data in the database
      const { data, error } = await supabase
        .from('featured_character_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching featured character videos:', error);
      }

      // If we have data from database, use it
      if (data && data.length > 0) {
        return data as FeaturedCharacterVideo[];
      }

      // Otherwise, return sample data with properly encoded URLs from Supabase storage
      const sampleData: FeaturedCharacterVideo[] = [
        {
          id: '1',
          character_id: 'b795b58e-19cb-426f-80b9-7899a1ebc3ff',
          name: 'Isabella',
          description: 'A compelling historical figure with a rich background and fascinating perspectives on life in her era.',
          video_url: 'https://wgerdrdsuusnrdnwwelt.supabase.co/storage/v1/object/public/character-videos/Isabella%20historical%207.1.25.mp4',
          thumbnail_url: null,
          character_type: 'historical',
          display_order: 1,
          is_active: true
        },
        {
          id: '2',
          character_id: 'rajiv-patel',
          name: 'Rajiv Patel',
          description: 'An innovative historical character with unique insights and a captivating personality that brings stories to life.',
          video_url: 'https://wgerdrdsuusnrdnwwelt.supabase.co/storage/v1/object/public/character-videos/Rajiv%20Patel.mp4',
          thumbnail_url: null,
          character_type: 'historical',
          display_order: 2,
          is_active: true
        }
      ];

      console.log('Using sample data for featured videos:', sampleData);
      return sampleData;
    },
  });
};
