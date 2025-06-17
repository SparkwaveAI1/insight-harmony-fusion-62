
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Persona } from '@/services/persona/types';

interface SendToPersonaSectionProps {
  loadedPersonas: Persona[];
  isLoading: boolean;
  onSendToPersona: (personaId: string) => void;
}

export const SendToPersonaSection: React.FC<SendToPersonaSectionProps> = ({
  loadedPersonas,
  isLoading,
  onSendToPersona
}) => {
  return (
    <Card className="flex-shrink-0 mt-6 p-4 bg-blue-50 border-blue-200">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Send to Personas</h4>
        <p className="text-xs text-muted-foreground">
          Send the current conversation to any of your active personas for their response
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {loadedPersonas.map((persona) => (
            <Button 
              key={persona.persona_id}
              onClick={() => onSendToPersona(persona.persona_id)}
              disabled={isLoading}
              variant="outline"
              className="justify-start"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : `To ${persona.name}`}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
