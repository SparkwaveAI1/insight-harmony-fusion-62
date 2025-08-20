import { useState, useEffect } from 'react';
import { PersonaV3 } from '@/types/persona-v3';
import { 
  getAllPersonas, 
  getPersonaById, 
  savePersona, 
  updatePersona,
  deletePersona,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  DbPersona
} from '@/services/persona';

export function usePersona() {
  const [personas, setPersonas] = useState<DbPersona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonas = async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPersonas(userId);
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
      const persona = await getPersonaById(personaId);
      return persona;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load persona');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPersona = async (personaData: CreatePersonaRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newPersona = await savePersona(personaData);
      setPersonas(prev => [newPersona, ...prev]);
      return newPersona;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create persona');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonaData = async (personaId: string, updates: UpdatePersonaRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPersona = await updatePersona(personaId, updates);
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
      await deletePersona(personaId);
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
    updatePersona: updatePersonaData,
    removePersona,
    refreshPersonas: loadPersonas
  };
}