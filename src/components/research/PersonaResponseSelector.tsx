
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
  
  if (!isVisible) {
    console.log('PersonaResponseSelector not visible');
    return null;
  }

  console.log('PersonaResponseSelector showing with personas:', personas.map(p => p.name));

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-800">Choose Next Responder</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select which persona should respond to the conversation next:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <Button
            key={persona.persona_id}
            variant="outline"
            onClick={() => {
              console.log('Persona selected:', persona.name, persona.persona_id);
              onSelect(persona.persona_id);
            }}
            className="h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group border-2"
          >
            <div className="flex items-start gap-3 w-full">
              <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all">
                <AvatarImage src={persona.image_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                  {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
                <div className="font-semibold text-sm text-left truncate w-full group-hover:text-blue-700 transition-colors">
                  {persona.name}
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
                
                {persona.trait_profile?.big_five && (
                  <div className="text-xs text-muted-foreground line-clamp-1 w-full text-left">
                    {Object.entries(persona.trait_profile.big_five)
                      .filter(([_, value]) => value !== null)
                      .slice(0, 2)
                      .map(([trait, score]) => `${trait}: ${score}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
