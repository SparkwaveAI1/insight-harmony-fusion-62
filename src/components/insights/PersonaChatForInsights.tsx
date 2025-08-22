import React from 'react';
import { PersonaChat } from '../personas/PersonaChat';

interface PersonaChatForInsightsProps {
  persona: any;
  personaId: string;
  question: string;
  onResponse: (response: string, traits: string[]) => void;
}

export function PersonaChatForInsights({ 
  persona, 
  personaId, 
  question, 
  onResponse 
}: PersonaChatForInsightsProps) {
  // This component can be used by Insights Engine
  // to automatically send questions to personas
  // and collect responses for analysis
  
  return (
    <PersonaChat
      persona={persona}
      personaId={personaId}
      title={`Insights: ${persona.name}`}
      height="h-64"
    />
  );
}