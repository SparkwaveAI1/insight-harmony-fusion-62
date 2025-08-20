
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import PersonaChatInterface from '@/components/persona-chat/PersonaChatInterface';

interface InterviewModeProps {
  onBack: () => void;
}

const InterviewMode: React.FC<InterviewModeProps> = ({ onBack }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error loading personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  if (selectedPersona) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPersona(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Persona
          </Button>
          <h2 className="text-2xl font-bold">1-on-1 Interview with {selectedPersona.name}</h2>
          <p className="text-muted-foreground">Research conversation mode</p>
        </div>
        
        <PersonaChatInterface personaId={selectedPersona.persona_id} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Modes
        </Button>
        <h2 className="text-2xl font-bold mb-2">1-on-1 Interview</h2>
        <p className="text-muted-foreground">Select a persona for your research interview</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <Card key={persona.persona_id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {persona.profile_image_url ? (
                    <img 
                      src={persona.profile_image_url} 
                      alt={persona.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {persona.metadata?.occupation || 'Persona'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {persona.description || 'Ready for research interview'}
                </p>
                <Button 
                  onClick={() => setSelectedPersona(persona)}
                  className="w-full"
                  size="sm"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewMode;
