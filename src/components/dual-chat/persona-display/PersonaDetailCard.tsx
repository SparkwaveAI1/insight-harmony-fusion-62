
import React from 'react';
import { Persona } from '@/services/persona/types';
import PersonaDemographicsCard from './PersonaDemographicsCard';
import PersonaInsights from './PersonaInsights';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SpeedInsight } from './PersonaInsightUtils';

interface PersonaDetailCardProps {
  persona: Persona;
}

const PersonaDetailCard: React.FC<PersonaDetailCardProps> = ({ persona }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Create mock insights based on persona data
  const createInsightsFromPersona = (persona: Persona): SpeedInsight[] => {
    return [
      {
        category: 'decision',
        value: persona.trait_profile?.decision_making_style || 'Balanced decision-maker',
        speed: 'medium'
      },
      {
        category: 'communication',
        value: persona.trait_profile?.communication_style || 'Clear communicator',
        speed: 'fast'
      },
      {
        category: 'learning',
        value: persona.trait_profile?.learning_style || 'Adaptive learner',
        speed: 'medium'
      },
      {
        category: 'workEthic',
        value: persona.trait_profile?.work_ethic || 'Dedicated worker',
        speed: 'fast'
      },
      {
        category: 'conflict',
        value: persona.trait_profile?.conflict_resolution_style || 'Collaborative problem solver',
        speed: 'medium'
      }
    ];
  };
  
  const insights = createInsightsFromPersona(persona);
  
  return (
    <div className="border rounded-md p-4 bg-[#F5F5F7]">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 border">
          {persona.profile_image_url ? (
            <AvatarImage src={persona.profile_image_url} alt={persona.name} />
          ) : (
            <AvatarFallback>{getInitials(persona.name)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{persona.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {persona.persona_id}</p>
        </div>
      </div>
      
      <PersonaDemographicsCard persona={persona} />
      <PersonaInsights insights={insights} />
    </div>
  );
};

export default PersonaDetailCard;
