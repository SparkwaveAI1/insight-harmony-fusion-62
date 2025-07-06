
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PersonaLoader from "./PersonaLoader";
import PersonaSelector from "./PersonaSelector";
import ActivePersonasDisplay from "./ActivePersonasDisplay";
import { useResearchSession } from './hooks/useResearchSession';

const ResearchInterface = () => {
  const {
    personas,
    activePersonaIds,
    title,
    description,
    loadPersonas,
    addPersona,
    removePersona,
    setTitle,
    setDescription,
  } = useResearchSession();

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const activePersonas = personas.filter(p => activePersonaIds.includes(p.persona_id));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Research Session Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ActivePersonasDisplay activePersonas={activePersonas} />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Available Personas</h3>
            <PersonaSelector
              personas={personas}
              selectedPersonas={activePersonaIds}
              onPersonaToggle={(personaId) => {
                if (activePersonaIds.includes(personaId)) {
                  removePersona(personaId);
                } else {
                  addPersona(personaId);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchInterface;
