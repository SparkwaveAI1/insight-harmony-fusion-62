
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseHighPerformanceCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

interface HighPerformanceCreativeCharactersResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useHighPerformanceCreativeCharacters = (
  options: UseHighPerformanceCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['high-performance-creative-characters-disabled', user?.id],
    queryFn: async (): Promise<HighPerformanceCreativeCharactersResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useHighPerformanceCreativeCharacters is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
  });
};
