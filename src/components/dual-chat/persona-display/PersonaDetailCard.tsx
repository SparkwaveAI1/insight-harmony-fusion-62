
import React from 'react';
import { Persona } from '@/services/persona/types';
import PersonaDemographicsCard from './PersonaDemographicsCard';
import PersonaInsights from './PersonaInsights';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SpeedInsight, getPersonaInsights } from './PersonaInsightUtils';

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
  
  // Use the utility function from PersonaInsightUtils to generate insights properly
  const insights = getPersonaInsights(persona);
  
  return (
    <div className="border rounded-md p-4 bg-[#F5F5F7]">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <Avatar className="h-20 w-20 border shadow-sm">
          {persona.profile_image_url ? (
            <AvatarImage src={persona.profile_image_url} alt={persona.name} />
          ) : (
            <AvatarFallback className="text-xl">{getInitials(persona.name)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="text-2xl font-medium">{persona.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {persona.persona_id}</p>
        </div>
      </div>
      
      <PersonaDemographicsCard persona={persona} />
      <PersonaInsights insights={insights} />
    </div>
  );
};

export default PersonaDetailCard;
