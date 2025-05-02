
import React from 'react';
import Card from '@/components/ui-custom/Card';
import { Persona } from '@/services/persona/types';
import { Brain, Target, Users } from 'lucide-react';

interface PersonaDisplayProps {
  personaA: Persona | null;
  personaB: Persona | null;
  personaAId: string;
  personaBId: string;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({
  personaA,
  personaB,
  personaAId,
  personaBId
}) => {
  if (!personaA || !personaB) {
    return (
      <Card className="mb-6 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <p className="font-semibold">Persona A {personaA ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
            {!personaA && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
          <div className="border rounded-md p-4 bg-muted/20">
            <p className="font-semibold">Persona B {personaB ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
            {!personaB && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Helper function to render persona details
  const renderPersonaDetails = (persona: Persona) => (
    <>
      <h3 className="text-lg font-semibold">{persona.name}</h3>
      <p className="text-sm text-muted-foreground">ID: {persona.persona_id}</p>
      
      {/* Demographics */}
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-1">Demographics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Age</p>
            <p>{persona.metadata?.age || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Gender</p>
            <p>{persona.metadata?.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Occupation</p>
            <p>{persona.metadata?.occupation || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium">Region</p>
            <p>{persona.metadata?.region || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Decisions section - NEW */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-1">
          <Brain className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Decisions</h4>
        </div>
        <p className="text-xs">
          {persona.trait_profile?.behavioral_economics?.risk_sensitivity && 
           parseFloat(persona.trait_profile.behavioral_economics.risk_sensitivity) > 0.6 ? 
            "Cautious decision-maker, avoids risks" : 
            "Embraces new opportunities, comfortable with risk"}
        </p>
      </div>
      
      {/* Drivers section - NEW */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-1">
          <Target className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Drivers</h4>
        </div>
        <p className="text-xs">
          {persona.trait_profile?.big_five?.openness && 
           parseFloat(persona.trait_profile.big_five.openness) > 0.6 ? 
            "Motivated by novelty and exploration" : 
            "Values stability and traditional approaches"}
        </p>
      </div>
      
      {/* Persuasion section - NEW */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-1">
          <Users className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Discussion & Persuasion</h4>
        </div>
        <p className="text-xs">
          {persona.trait_profile?.big_five?.agreeableness && 
           parseFloat(persona.trait_profile.big_five.agreeableness) > 0.6 ? 
            "Receptive to collaboration, values harmony in discussions" : 
            "Prefers direct communication, focuses on facts over feelings"}
        </p>
      </div>
    </>
  );

  return (
    <Card className="mb-6 p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-md p-4">
          {renderPersonaDetails(personaA)}
        </div>
        
        <div className="border rounded-md p-4">
          {renderPersonaDetails(personaB)}
        </div>
      </div>
    </Card>
  );
};

export default PersonaDisplay;
