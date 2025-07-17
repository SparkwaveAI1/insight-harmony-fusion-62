
import { useQuery } from '@tanstack/react-query';
import { getAllCharacters } from '../services/characterService';

export const useCharacters = () => {
  return useQuery({
    queryKey: ['humanoid-characters'],
    queryFn: getAllCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
