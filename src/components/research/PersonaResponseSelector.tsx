
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';
import { Persona } from '@/services/persona/types';

interface PersonaResponseSelectorProps {
  personas: Persona[];
  onSelect: (personaId: string) => void;
  isVisible: boolean;
}

export const PersonaResponseSelector: React.FC<PersonaResponseSelectorProps> = ({
  personas,
  onSelect,
  isVisible
}) => {
  console.log('PersonaResponseSelector rendered:', { isVisible, personasCount: personas.length });
  
  if (!isVisible || personas.length === 0) {
    console.log('PersonaResponseSelector not visible or no personas');
    return null;
  }

  console.log('PersonaResponseSelector showing with personas:', personas.map(p => p.name));

  // Since we're limiting to one persona, show a single prominent button
  const persona = personas[0];

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-800">Generate Response</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Click the button below to generate a response from your selected persona:
      </p>
      
      <Button
        onClick={() => {
          console.log('Persona selected:', persona.name, persona.persona_id);
          onSelect(persona.persona_id);
        }}
        className="w-full h-auto p-4 justify-start bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 text-left"
        variant="outline"
      >
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-blue-200">
            <AvatarImage src={persona.image_url} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
              {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="font-semibold text-sm text-left text-blue-800">
              Generate response from {persona.name}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {persona.metadata?.occupation && (
                <Badge variant="secondary" className="text-xs">
                  {persona.metadata.occupation}
                </Badge>
              )}
              {persona.metadata?.age && (
                <Badge variant="outline" className="text-xs">
                  Age {persona.metadata.age}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Button>
    </Card>
  );
};
