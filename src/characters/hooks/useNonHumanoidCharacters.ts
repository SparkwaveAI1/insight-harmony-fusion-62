
import { useQuery } from '@tanstack/react-query';
import { getAllNonHumanoidCharacters } from '../services/nonHumanoidCharacterService';

export const useNonHumanoidCharacters = () => {
  return useQuery({
    queryKey: ['non-humanoid-characters'],
    queryFn: getAllNonHumanoidCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
