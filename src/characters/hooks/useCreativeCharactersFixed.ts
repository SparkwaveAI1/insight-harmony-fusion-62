
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseCreativeCharactersFixedOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  enableSearch?: boolean;
}

interface CreativeCharactersResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useCreativeCharactersFixed = (
  options: UseCreativeCharactersFixedOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['creative-characters-fixed-disabled', user?.id],
    queryFn: async (): Promise<CreativeCharactersResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useCreativeCharactersFixed is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
  });
};
