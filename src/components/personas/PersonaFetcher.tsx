import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Card from '@/components/ui-custom/Card';
import { formatName } from '@/lib/utils';
import { getPersonaByPersonaId } from '@/services/persona'; // Updated import path

interface PersonaFetcherProps {
  personaId: string;
}

const PersonaFetcher: React.FC<PersonaFetcherProps> = ({ personaId }) => {
  // Use React Query to fetch the persona with better error handling
  const { data: activePersona, isLoading, error } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: () => getPersonaByPersonaId(personaId),
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

  // Check if this is a V4 persona
  const isV4Persona = activePersona.version === 'v4.0' || activePersona.version?.startsWith('v4');
  
  if (isV4Persona) {
    // Render V4 persona format
    const fullProfile = activePersona.persona_data as any;
    const identity = fullProfile?.identity;
    const knowledge = fullProfile?.knowledge_profile;
    const communication = fullProfile?.communication_style;
    const emotional = fullProfile?.emotional_profile;
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{formatName(activePersona.name)}</h2>
          <div className="mb-4">
            <strong>Persona ID:</strong> {activePersona.persona_id}
            <br />
            <strong>Version:</strong> {activePersona.version}
            <br />
            <strong>Created:</strong> {new Date(activePersona.created_at).toLocaleDateString()}
            <br />
            <strong>Description:</strong> {activePersona.description || 'Enhanced V4 Persona'}
          </div>
        </Card>

        {identity && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Identity & Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Age:</strong> {identity.age || 'Not specified'}
                <br />
                <strong>Gender:</strong> {identity.gender || 'Not specified'}
                <br />
                <strong>Pronouns:</strong> {identity.pronouns || 'Not specified'}
                <br />
                <strong>Ethnicity:</strong> {identity.ethnicity || 'Not specified'}
                <br />
                <strong>Nationality:</strong> {identity.nationality || 'Not specified'}
              </div>
              <div>
                <strong>Location:</strong> {
                  identity.location ? 
                    `${identity.location.city || ''}, ${identity.location.region || ''}, ${identity.location.country || ''}`.replace(/^, |, $|, , /g, '').replace(/^, /, '') 
                    : 'Not specified'
                }
                <br />
                <strong>Occupation:</strong> {identity.occupation || 'Not specified'}
                <br />
                <strong>Relationship Status:</strong> {identity.relationship_status || 'Not specified'}
                <br />
                <strong>Dependents:</strong> {identity.dependents !== undefined ? identity.dependents : 'Not specified'}
              </div>
            </div>
          </Card>
        )}

        {knowledge && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Knowledge Profile</h3>
            <div className="space-y-2">
              <div><strong>Education Level:</strong> {knowledge.education_level || 'Not specified'}</div>
              <div><strong>Vocabulary Ceiling:</strong> {knowledge.vocabulary_ceiling || 'Not specified'}</div>
              {knowledge.expertise_domains && knowledge.expertise_domains.length > 0 && (
                <div><strong>Expertise:</strong> {knowledge.expertise_domains.join(', ')}</div>
              )}
              {knowledge.knowledge_gaps && knowledge.knowledge_gaps.length > 0 && (
                <div><strong>Knowledge Gaps:</strong> {knowledge.knowledge_gaps.join(', ')}</div>
              )}
              <div><strong>Learning Style:</strong> {knowledge.learning_style || 'Not specified'}</div>
            </div>
          </Card>
        )}

        {communication && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Communication Style</h3>
            <div className="space-y-2">
              {communication.voice_foundation && (
                <>
                  <div><strong>Directness:</strong> {communication.voice_foundation.directness_level || 'Not specified'}</div>
                  <div><strong>Formality:</strong> {communication.voice_foundation.formality_default || 'Not specified'}</div>
                  <div><strong>Emotional Expression:</strong> {communication.voice_foundation.emotional_expression || 'Not specified'}</div>
                  <div><strong>Pace & Rhythm:</strong> {communication.voice_foundation.pace_rhythm || 'Not specified'}</div>
                </>
              )}
              {communication.linguistic_signature?.signature_phrases && communication.linguistic_signature.signature_phrases.length > 0 && (
                <div><strong>Signature Phrases:</strong> "{communication.linguistic_signature.signature_phrases.join('", "')}"</div>
              )}
              {communication.lexical_profile && (
                <div><strong>Vocabulary Level:</strong> {communication.lexical_profile.vocabulary_level || 'Not specified'}</div>
              )}
            </div>
          </Card>
        )}

        {emotional && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Emotional Profile</h3>
            <div className="space-y-2">
              {emotional.positive_triggers && emotional.positive_triggers.length > 0 && (
                <div><strong>Positive Triggers:</strong> {emotional.positive_triggers.join(', ')}</div>
              )}
              {emotional.negative_triggers && emotional.negative_triggers.length > 0 && (
                <div><strong>Negative Triggers:</strong> {emotional.negative_triggers.join(', ')}</div>
              )}
              {emotional.explosive_triggers && emotional.explosive_triggers.length > 0 && (
                <div><strong>Explosive Triggers:</strong> {emotional.explosive_triggers.join(', ')}</div>
              )}
              <div><strong>Emotional Regulation:</strong> {emotional.emotional_regulation || 'Not specified'}</div>
              {emotional.stress_responses && emotional.stress_responses.length > 0 && (
                <div><strong>Stress Responses:</strong> {emotional.stress_responses.join(', ')}</div>
              )}
            </div>
          </Card>
        )}

        {fullProfile?.motivation_profile && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Motivation Profile</h3>
            <div className="space-y-2">
              {fullProfile.motivation_profile.primary_drivers && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(fullProfile.motivation_profile.primary_drivers).map(([key, value]) => (
                    <div key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value as string}</div>
                  ))}
                </div>
              )}
              {fullProfile.motivation_profile.goal_orientation?.primary_goals && (
                <div className="mt-4">
                  <strong>Primary Goals:</strong>
                  <ul className="list-disc list-inside ml-4 mt-2">
                    {fullProfile.motivation_profile.goal_orientation.primary_goals.map((goal: any, idx: number) => (
                      <li key={idx}>{goal.goal} (Intensity: {goal.intensity}/10)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Render V3 persona format (original code)
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
            <strong>Age:</strong> {
              activePersona.persona_data?.identity?.age && activePersona.persona_data.identity.age !== 0 
                ? activePersona.persona_data.identity.age 
                : (activePersona.metadata?.age || 'Not specified')
            }
            <br />
            <strong>Gender:</strong> {
              activePersona.persona_data?.identity?.gender || 
              activePersona.metadata?.gender || 
              'Not specified'
            }
            <br />
            <strong>Ethnicity:</strong> {
              activePersona.persona_data?.identity?.ethnicity || 
              activePersona.metadata?.race_ethnicity || 
              'Not specified'
            }
            <br />
            <strong>Region:</strong> {
              activePersona.persona_data?.identity?.region || 
              (activePersona.persona_data?.identity?.location ? 
                `${activePersona.persona_data.identity.location.city || ''}, ${activePersona.persona_data.identity.location.region || ''}, ${activePersona.persona_data.identity.location.country || ''}`.replace(/^, |, $|, , /g, '').replace(/^, /, '') || 'Not specified'
                : activePersona.metadata?.region || 'Not specified')
            }
          </div>
          <div>
            <strong>Education:</strong> {
              activePersona.persona_data?.identity?.education_level || 
              activePersona.metadata?.education_level || 
              'Not specified'
            }
            <br />
            <strong>Occupation:</strong> {
              activePersona.persona_data?.identity?.occupation && activePersona.persona_data.identity.occupation !== 'unemployed'
                ? activePersona.persona_data.identity.occupation
                : (activePersona.metadata?.occupation || 'Not specified')
            }
            <br />
            <strong>Income Level:</strong> {
              activePersona.persona_data?.identity?.income_level || 
              activePersona.metadata?.income_level || 
              'Not specified'
            }
            <br />
            <strong>Relationship:</strong> {
              activePersona.persona_data?.identity?.relationship_status || 
              activePersona.metadata?.relationship_status || 
              'Not specified'
            }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaFetcher;
