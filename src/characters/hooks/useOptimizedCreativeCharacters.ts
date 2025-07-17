
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseOptimizedCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

interface OptimizedCreativeCharactersResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useOptimizedCreativeCharacters = (
  options: UseOptimizedCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['optimized-creative-characters-disabled', user?.id],
    queryFn: async (): Promise<OptimizedCreativeCharactersResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useOptimizedCreativeCharacters is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
  });
};
