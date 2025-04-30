
import { useState } from 'react';
import { toast } from 'sonner';
import { usePersona } from '@/hooks/usePersona';

export const usePersonaSelection = () => {
  const [personaAId, setPersonaAId] = useState('');
  const [personaBId, setPersonaBId] = useState('');
  
  const { loadMultiplePersonas, activePersonas, isLoading, clearPersonas } = usePersona();
  
  const handleLoadPersonas = async () => {
    if (!personaAId || !personaBId) {
      toast.error('Please enter both persona IDs');
      return;
    }
    
    if (personaAId === personaBId) {
      toast.error('Please select two different personas');
      return;
    }
    
    try {
      clearPersonas(); // Clear any previously loaded personas
      await loadMultiplePersonas([personaAId, personaBId]);
      toast.success('Personas loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load personas:', error);
      toast.error('Failed to load one or both personas');
      return false;
    }
  };
  
  const getPersonaA = () => {
    return activePersonas[0] || null;
  };
  
  const getPersonaB = () => {
    return activePersonas[1] || null;
  };
  
  const getPersonaName = (type: 'personaA' | 'personaB') => {
    const persona = type === 'personaA' ? getPersonaA() : getPersonaB();
    return persona?.name || type;
  };

  return {
    personaAId,
    personaBId,
    setPersonaAId,
    setPersonaBId,
    handleLoadPersonas,
    getPersonaA,
    getPersonaB,
    getPersonaName,
    activePersonas,
    isLoading
  };
};
