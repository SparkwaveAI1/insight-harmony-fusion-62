
import { useQuery } from '@tanstack/react-query';
import { getAllCreativeCharacters } from '../services/unifiedCharacterService';

export const useCreativeCharactersFixed = () => {
  return useQuery({
    queryKey: ['creative-characters-fixed'],
    queryFn: getAllCreativeCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
