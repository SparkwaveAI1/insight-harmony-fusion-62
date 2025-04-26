
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import Card from '@/components/ui-custom/Card';
import { formatName } from '@/lib/utils';
import { usePersona } from '@/hooks/usePersona';

interface PersonaFetcherProps {
  personaId: string;
}

const PersonaFetcher: React.FC<PersonaFetcherProps> = ({ personaId }) => {
  const { loadPersona, activePersona, isLoading, error } = usePersona();

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        console.log(`PersonaFetcher - Fetching persona with ID: ${personaId}`);
        await loadPersona(personaId);
      } catch (error) {
        console.error('PersonaFetcher - Error fetching persona:', error);
        toast.error('Failed to fetch persona');
      }
    };

    fetchPersona();
  }, [personaId, loadPersona]);

  if (isLoading) {
    return <div className="p-6 bg-muted/20 rounded-lg animate-pulse">Loading persona...</div>;
  }

  if (error || !activePersona) {
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
      <h2 className="text-xl font-bold mb-4">{formatName(activePersona.name)}</h2>
      <div className="mb-4">
        <strong>Persona ID:</strong> {activePersona.persona_id}
        <br />
        <strong>Created:</strong> {activePersona.creation_date}
        <br />
        <strong>Prompt:</strong> {activePersona.prompt || 'No prompt available'}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Age:</strong> {activePersona.metadata.age || 'Not specified'}
            <br />
            <strong>Gender:</strong> {activePersona.metadata.gender || 'Not specified'}
            <br />
            <strong>Ethnicity:</strong> {activePersona.metadata.race_ethnicity || 'Not specified'}
            <br />
            <strong>Region:</strong> {activePersona.metadata.region || 'Not specified'}
          </div>
          <div>
            <strong>Education:</strong> {activePersona.metadata.education_level || 'Not specified'}
            <br />
            <strong>Occupation:</strong> {activePersona.metadata.occupation || 'Not specified'}
            <br />
            <strong>Income Level:</strong> {activePersona.metadata.income_level || 'Not specified'}
            <br />
            <strong>Relationship:</strong> {activePersona.metadata.relationship_status || 'Not specified'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaFetcher;
