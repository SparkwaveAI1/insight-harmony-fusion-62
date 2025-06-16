import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Loader2 } from 'lucide-react';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import { PersonaLoaderProps } from './types';
import { toast } from 'sonner';

export const PersonaLoader: React.FC<PersonaLoaderProps> = ({
  maxPersonas,
  onStartSession,
  isLoading
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPersonas = async () => {
      setLoading(true);
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load personas');
        toast.error(err.message || 'Failed to load personas');
      } finally {
        setLoading(false);
      }
    };

    loadPersonas();
  }, []);

  const togglePersonaSelection = (personaId: string) => {
    if (selectedPersonas.includes(personaId)) {
      setSelectedPersonas(selectedPersonas.filter(id => id !== personaId));
    } else {
      if (selectedPersonas.length < maxPersonas) {
        setSelectedPersonas([...selectedPersonas, personaId]);
      } else {
        toast.warning(`You can only select up to ${maxPersonas} personas`);
      }
    }
  };

  const handleStartSession = () => {
    if (selectedPersonas.length === 0) {
      toast.error('Please select at least one persona to start the session');
      return;
    }
    onStartSession(selectedPersonas);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Select Personas ({selectedPersonas.length}/{maxPersonas})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4">
              {personas.map((persona) => (
                <Card key={persona.persona_id} className="border">
                  <CardContent className="flex items-center justify-between p-3 space-x-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={persona.profile_image_url} alt={persona.name} />
                        <AvatarFallback>
                          {persona.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium">{persona.name}</h3>
                        {persona.metadata?.occupation && (
                          <Badge variant="secondary" className="text-xs">
                            {persona.metadata.occupation}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Checkbox
                      id={`persona-${persona.persona_id}`}
                      checked={selectedPersonas.includes(persona.persona_id)}
                      onCheckedChange={() => togglePersonaSelection(persona.persona_id)}
                      disabled={isLoading}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
        <Button
          className="w-full mt-4"
          onClick={handleStartSession}
          disabled={isLoading || personas.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              Start Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
