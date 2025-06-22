
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCharacters } from '../services/characterService';
import { Character } from '../types/characterTraitTypes';

export const useCharacters = () => {
  return useQuery({
    queryKey: ['characters'],
    queryFn: getAllCharacters,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
