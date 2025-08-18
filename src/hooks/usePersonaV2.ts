import { useState, useEffect } from 'react';
import { PersonaV2 } from '@/types/persona-v2';
import { 
  getAllPersonasV2, 
  getPersonaV2ById, 
  savePersonaV2, 
  updatePersonaV2,
  deletePersonaV2 
} from '@/services/persona/operations/personaV2Operations';

export function usePersonaV2() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonas = async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPersonasV2(userId);
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const loadPersona = async (personaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const persona = await getPersonaV2ById(personaId);
      return persona;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load persona');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPersona = async (personaData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newPersona = await savePersonaV2(personaData);
      setPersonas(prev => [newPersona, ...prev]);
      return newPersona;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = async (personaId: string, updates: any) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPersona = await updatePersonaV2(personaId, updates);
      setPersonas(prev => 
        prev.map(p => p.persona_id === personaId ? updatedPersona : p)
      );
      return updatedPersona;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update persona');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removePersona = async (personaId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePersonaV2(personaId);
      setPersonas(prev => prev.filter(p => p.persona_id !== personaId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete persona');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    personas,
    loading,
    error,
    loadPersonas,
    loadPersona,
    createPersona,
    updatePersona,
    removePersona,
    refreshPersonas: loadPersonas
  };
}