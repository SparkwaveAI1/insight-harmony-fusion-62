
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseUnifiedCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
}

interface UnifiedCreativeCharactersResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useUnifiedCreativeCharacters = (
  options: UseUnifiedCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['unified-creative-characters-disabled', user?.id],
    queryFn: async (): Promise<UnifiedCreativeCharactersResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useUnifiedCreativeCharacters is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
  });
};
