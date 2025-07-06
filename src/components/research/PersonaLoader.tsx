
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { getAllPersonas } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { getMetadataField, getLocationFromMetadata } from "@/services/persona/utils/metadataUtils";

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

  if (loading) {
    return <p>Loading personas...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid gap-4">
      {personas.map((persona) => {
        const age = getMetadataField(persona.metadata, 'age');
        const occupation = getMetadataField(persona.metadata, 'occupation');
        const location = getLocationFromMetadata(persona.metadata);

        return (
          <Card key={persona.persona_id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={persona.profile_image_url} alt={persona.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{persona.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {age} • {occupation}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {location}
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
