
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseUnifiedCreativeCharactersSimplifiedOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

interface UnifiedCreativeCharactersSimplifiedResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useUnifiedCreativeCharactersSimplified = (
  options: UseUnifiedCreativeCharactersSimplifiedOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['unified-creative-characters-simplified-disabled', user?.id],
    queryFn: async (): Promise<UnifiedCreativeCharactersSimplifiedResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useUnifiedCreativeCharactersSimplified is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
  });
};
