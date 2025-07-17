
import { useQuery } from '@tanstack/react-query';
import { getAllHistoricalCharacters } from '../services/unifiedCharacterService';
import { useAuth } from '@/context/AuthContext';

export const useHistoricalCharacters = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['historical-characters', user?.id],
    queryFn: () => getAllHistoricalCharacters(user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user, // Only run query when user is authenticated
  });
};
