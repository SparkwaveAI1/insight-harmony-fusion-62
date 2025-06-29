
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUnifiedCharacters, UnifiedCharacter } from '../services/unifiedCharacterService';

export const useCharacters = () => {
  return useQuery({
    queryKey: ['unified-characters'],
    queryFn: getAllUnifiedCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
