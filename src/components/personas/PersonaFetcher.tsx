
import React, { useState, useEffect } from 'react';
import { getPersonaByPersonaId } from '@/services/persona/personaService';
import { Persona } from '@/services/persona/types';
import { toast } from 'sonner';
import Card from '@/components/ui-custom/Card';
import { formatName } from '@/lib/utils';

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
        console.log(`PersonaFetcher - Fetching persona with ID: ${personaId}`);
        const fetchedPersona = await getPersonaByPersonaId(personaId);
        
        if (fetchedPersona) {
          console.log(`PersonaFetcher - Successfully fetched persona:`, fetchedPersona);
          setPersona(fetchedPersona);
        } else {
          console.error(`PersonaFetcher - No persona found with ID: ${personaId}`);
          toast.error(`No persona found with ID: ${personaId}`);
        }
      } catch (error) {
        console.error('PersonaFetcher - Error fetching persona:', error);
        toast.error('Failed to fetch persona');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersona();
  }, [personaId]);

  if (isLoading) {
    return <div className="p-6 bg-muted/20 rounded-lg animate-pulse">Loading persona...</div>;
  }

  if (!persona) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-500">No persona found</h3>
          <p className="mb-4">Could not find persona with ID: {personaId}</p>
          <p className="text-sm text-muted-foreground">
            Check the console logs for more details on why the persona wasn't found.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{formatName(persona.name)}</h2>
      <div className="mb-4">
        <strong>Persona ID:</strong> {persona.persona_id}
        <br />
        <strong>Created:</strong> {persona.creation_date}
        <br />
        <strong>Prompt:</strong> {persona.prompt || 'No prompt available'}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Age:</strong> {persona.metadata.age || 'Not specified'}
            <br />
            <strong>Gender:</strong> {persona.metadata.gender || 'Not specified'}
            <br />
            <strong>Ethnicity:</strong> {persona.metadata.race_ethnicity || 'Not specified'}
            <br />
            <strong>Region:</strong> {persona.metadata.region || 'Not specified'}
          </div>
          <div>
            <strong>Education:</strong> {persona.metadata.education_level || 'Not specified'}
            <br />
            <strong>Occupation:</strong> {persona.metadata.occupation || 'Not specified'}
            <br />
            <strong>Income Level:</strong> {persona.metadata.income_level || 'Not specified'}
            <br />
            <strong>Relationship:</strong> {persona.metadata.relationship_status || 'Not specified'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaFetcher;
