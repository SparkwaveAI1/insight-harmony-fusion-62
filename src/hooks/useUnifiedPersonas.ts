import { useState, useEffect } from 'react';
import { 
  getAllUnifiedPersonas, 
  getUnifiedPersonaById, 
  getUnifiedPersonasForListing,
  UnifiedPersona 
} from '../services/persona/operations/unifiedPersonaOperations';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for fetching all unified personas (V2 priority)
 */
export function useUnifiedPersonas(lightweight = false) {
  const [personas, setPersonas] = useState<UnifiedPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPersonas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = lightweight 
        ? await getUnifiedPersonasForListing()
        : await getAllUnifiedPersonas(user?.id);
      
      setPersonas(data);
    } catch (err) {
      console.error('Error fetching unified personas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch personas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, [user?.id, lightweight]);

  return {
    personas,
    isLoading,
    error,
    refetch: fetchPersonas,
  };
}

/**
 * Hook for fetching a single unified persona by ID (V2 priority)
 */
export function useUnifiedPersona(personaId: string | null) {
  const [persona, setPersona] = useState<UnifiedPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersona = async () => {
    if (!personaId) {
      setPersona(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getUnifiedPersonaById(personaId);
      setPersona(data);
    } catch (err) {
      console.error('Error fetching unified persona:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch persona');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersona();
  }, [personaId]);

  return {
    persona,
    isLoading,
    error,
    refetch: fetchPersona,
  };
}

/**
 * Hook for checking persona counts by version
 */
export function usePersonaVersionStats() {
  const [stats, setStats] = useState({
    v1Count: 0,
    v2Count: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const personas = await getAllUnifiedPersonas(user?.id);
      
      const v1Count = personas.filter(p => p.version === 'v1').length;
      const v2Count = personas.filter(p => p.version === 'v2').length;
      
      setStats({
        v1Count,
        v2Count,
        totalCount: personas.length,
      });
    } catch (err) {
      console.error('Error fetching persona version stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}