import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { getAllPersonas } from "@/services/persona";
import { Persona } from "@/services/persona/types";

interface PersonaInfo {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  education: string;
  income: string;
  location: string;
  ethnicity: string;
}

const PersonaLoader = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      setLoading(true);
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load personas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const getPersonaInfo = (persona: Persona) => {
    const metadata = persona.metadata || {};
    
    return {
      name: persona.name || 'Unknown',
      age: metadata.age || 'Unknown',
      gender: metadata.gender || 'Unknown',
      occupation: metadata.occupation || 'Unknown',
      education: metadata.education_level || 'Unknown',
      income: metadata.income_level || 'Unknown',
      location: metadata.region || metadata.location_history?.current_residence || 'Unknown',
      ethnicity: metadata.race_ethnicity || 'Unknown'
    };
  };

  if (loading) {
    return <p>Loading personas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid gap-4">
      {personas.map((persona) => {
        const personaInfo = getPersonaInfo(persona);

        return (
          <Card key={persona.persona_id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={persona.profile_image_url} alt={personaInfo.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{personaInfo.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {personaInfo.age} • {personaInfo.occupation}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {personaInfo.location}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PersonaLoader;
