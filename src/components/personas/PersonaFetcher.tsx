import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Card from '@/components/ui-custom/Card';
import { formatName } from '@/lib/utils';
import { getPersonaById } from '@/services/persona';

interface PersonaFetcherProps {
  personaId: string;
}

const PersonaFetcher: React.FC<PersonaFetcherProps> = ({ personaId }) => {
  // Use React Query to fetch the persona with better error handling
  const { data: activePersona, isLoading, error } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: () => getPersonaById(personaId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Handle errors with useEffect
  useEffect(() => {
    if (error) {
      console.error('PersonaFetcher - Error fetching persona:', error);
      toast.error('Failed to fetch persona');
    }
  }, [error]);

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
        <strong>Created:</strong> {activePersona.created_at}
        <br />
        <strong>Description:</strong> {activePersona.description || 'No description available'}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">V2 Persona Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Age:</strong> {activePersona.persona_data?.identity?.age || 'Not specified'}
            <br />
            <strong>Name:</strong> {activePersona.name || 'Not specified'}
            <br />
            <strong>Location:</strong> {typeof activePersona.persona_data?.identity?.location === 'string' 
              ? activePersona.persona_data.identity.location 
              : activePersona.persona_data?.identity?.location?.city || 'Not specified'}
            <br />
            <strong>Occupation:</strong> {activePersona.persona_data?.identity?.occupation || 'Not specified'}
          </div>
          <div>
            <strong>Type:</strong> {activePersona.persona_type || 'Not specified'}
            <br />
            <strong>Public:</strong> {activePersona.is_public ? 'Yes' : 'No'}
            <br />
            <strong>V2 Structure:</strong> Available
            <br />
            <strong>Voicepack:</strong> {activePersona.voicepack_runtime ? 'Compiled' : 'Not compiled'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaFetcher;
