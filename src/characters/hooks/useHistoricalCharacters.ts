
import { useQuery } from '@tanstack/react-query';
import { getAllCharacters } from '../services/characterService';

export const useHistoricalCharacters = () => {
  return useQuery({
    queryKey: ['historical-characters'],
    queryFn: async () => {
      const allCharacters = await getAllCharacters();
      // Filter to only show characters with creation_source = 'historical'
      return allCharacters.filter(character => character.creation_source === 'historical');
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
