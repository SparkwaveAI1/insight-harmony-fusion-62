import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/components/persona-chat/types';
import { Persona } from '@/services/persona/types';
import { ResearchMessage } from './ResearchMessage';

interface ResearchResponseGroupProps {
  userMessage: Message;
  personaResponses: (Message & { responding_persona_id: string })[];
  loadedPersonas: Persona[];
}

export const ResearchResponseGroup: React.FC<ResearchResponseGroupProps> = ({
  userMessage,
  personaResponses,
  loadedPersonas
}) => {
  const getPersonaInfo = (personaId: string) => {
    return loadedPersonas.find(p => p.persona_id === personaId);
  };

  return (
    <div className="space-y-4">
      {/* User Question */}
      <ResearchMessage message={userMessage} />
      
      {/* Persona Responses */}
      {personaResponses.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="mb-3">
            <Badge variant="secondary" className="mb-2">
              {personaResponses.length} Persona Response{personaResponses.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="space-y-4">
            {personaResponses.map((response, index) => {
              const persona = getPersonaInfo(response.responding_persona_id);
              return (
                <div key={index} className="border-l-2 border-blue-300 pl-4">
                  <ResearchMessage 
                    message={response} 
                    persona={persona}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};