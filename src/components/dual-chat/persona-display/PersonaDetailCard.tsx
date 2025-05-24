
import React from 'react';
import { Persona } from '@/services/persona/types';
import PersonaDemographicsCard from './PersonaDemographicsCard';
import PersonaInsights from './PersonaInsights';
import { getPersonaInsights } from './PersonaInsightUtils';

interface PersonaDetailCardProps {
  persona: Persona;
}

const PersonaDetailCard: React.FC<PersonaDetailCardProps> = ({ persona }) => {
  const insights = getPersonaInsights(persona);
  
  return (
    <div className="border rounded-md p-4 bg-[#F8F9FA]">
      <h3 className="text-lg font-semibold">{persona.name}</h3>
      <p className="text-sm text-muted-foreground">ID: {persona.persona_id}</p>
      
      {/* Demographics */}
      <PersonaDemographicsCard persona={persona} />
      
      {/* Insights */}
      <PersonaInsights insights={insights} />
    </div>
  );
};

export default PersonaDetailCard;
