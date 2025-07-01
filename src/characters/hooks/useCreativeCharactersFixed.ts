
import { useQuery } from '@tanstack/react-query';
import { getAllCreativeCharacters } from '../services/unifiedCharacterService';
import { useAuth } from '@/context/AuthContext';

export const useCreativeCharactersFixed = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['creative-characters-fixed', user?.id],
    queryFn: () => getAllCreativeCharacters(user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user, // Only run query when user is authenticated
  });
};
