
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
          description: 'Born into Castilian nobility in the 15th century, Isabella navigated the complex political landscape of medieval Iberia with remarkable acumen. Her early years were shaped by civil war and dynastic struggles that would forge her into a formidable ruler. She understood that true power came not just from birthright, but from the careful cultivation of alliances and the unwavering pursuit of her kingdom\'s interests. Her legacy would forever change the course of Spanish and world history.',
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
          description: 'A brilliant software engineer from Mumbai who immigrated to Silicon Valley in the early 2000s during the tech boom. Rajiv\'s journey embodies the modern immigrant experience in America\'s technology sector, balancing traditional Indian values with Silicon Valley\'s fast-paced innovation culture. His expertise in artificial intelligence and machine learning has made him a sought-after voice in tech circles. He represents a generation of global professionals reshaping the landscape of American technology.',
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
