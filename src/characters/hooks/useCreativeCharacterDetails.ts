
import { useQuery } from '@tanstack/react-query';
import { getCreativeCharacter } from '../services/creativeCharacterService';

interface UseCreativeCharacterDetailsOptions {
  enabled?: boolean;
  prefetch?: boolean;
}

export const useCreativeCharacterDetails = (
  characterId: string | null, 
  options: UseCreativeCharacterDetailsOptions = {}
) => {
  const { enabled = true, prefetch = false } = options;
  
  return useQuery({
    queryKey: ['creative-character-details', characterId],
    queryFn: () => {
      if (!characterId) throw new Error('Character ID is required');
      console.log('🔍 Lazy loading full character details for:', characterId);
      return getCreativeCharacter(characterId);
    },
    enabled: enabled && !!characterId,
    staleTime: prefetch ? 1000 * 60 * 10 : 1000 * 60 * 5, // Longer cache for prefetched data
    retry: 1,
  });
};
