
import React, { useState, useEffect } from 'react';
import { getPersonaByPersonaId, Persona } from '@/services/persona/personaService';
import { toast } from 'sonner';
import Card from '@/components/ui-custom/Card';

interface PersonaFetcherProps {
  personaId: string;
}

const PersonaFetcher: React.FC<PersonaFetcherProps> = ({ personaId }) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersona = async () => {
      setIsLoading(true);
      try {
        const fetchedPersona = await getPersonaByPersonaId(personaId);
        setPersona(fetchedPersona);
        
        if (!fetchedPersona) {
          toast.error(`No persona found with ID: ${personaId}`);
        }
      } catch (error) {
        console.error('Error fetching persona:', error);
        toast.error('Failed to fetch persona');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersona();
  }, [personaId]);

  if (isLoading) {
    return <div>Loading persona...</div>;
  }

  if (!persona) {
    return <div>No persona found with ID: {personaId}</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{persona.name}</h2>
      <div>
        <strong>Persona ID:</strong> {persona.persona_id}
        <br />
        <strong>Created:</strong> {persona.creation_date}
        <br />
        <strong>Prompt:</strong> {persona.prompt || 'No prompt available'}
      </div>
    </Card>
  );
};

export default PersonaFetcher;
