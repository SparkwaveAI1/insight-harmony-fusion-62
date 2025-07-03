
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CreativeCharacter } from '../types/creativeCharacterTypes';

interface UseCreativeCharactersOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  enableSearch?: boolean;
}

interface CreativeCharactersResult {
  characters: CreativeCharacter[];
  totalCount: number;
}

export const useCreativeCharacters = (
  options: UseCreativeCharactersOptions = {}
) => {
  const { user, isLoading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ['creative-characters-disabled', user?.id],
    queryFn: async (): Promise<CreativeCharactersResult> => {
      // DISABLED: This hook is temporarily disabled to prevent database contention
      // Use useStandardizedCreativeCharacters instead
      console.log('⚠️ useCreativeCharacters is disabled - use useStandardizedCreativeCharacters');
      return { characters: [], totalCount: 0 };
    },
    enabled: false, // Completely disable this hook
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
