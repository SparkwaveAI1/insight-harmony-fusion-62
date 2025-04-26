
import { useContext } from 'react';
import { PersonaContext } from '@/context/PersonaProvider';
import { PersonaContextType } from '@/context/PersonaContext.types';

/**
 * Custom hook to access the Persona context
 * 
 * @example
 * const { activePersona, loadPersona } = usePersona();
 * 
 * // Load a persona
 * useEffect(() => {
 *   if (personaId) {
 *     loadPersona(personaId);
 *   }
 * }, [personaId, loadPersona]);
 */
export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  
  return context;
};
