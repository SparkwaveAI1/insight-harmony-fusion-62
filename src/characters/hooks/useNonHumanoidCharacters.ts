
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getAllNonHumanoidCharacters } from '../services/nonHumanoidCharacterService';

export const useNonHumanoidCharacters = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['non-humanoid-characters', user?.id],
    queryFn: getAllNonHumanoidCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user, // Only run the query if user is authenticated
  });
};
