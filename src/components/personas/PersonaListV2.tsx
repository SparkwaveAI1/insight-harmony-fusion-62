import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { getAllPersonasV2 } from '@/services/persona';
import { DbPersonaV2 } from '@/services/persona/types/persona-v2-db';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PersonaListV2 = () => {
  const [personas, setPersonas] = useState<DbPersonaV2[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPersonasV2();
      setPersonas(data);
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPersonas = personas.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (persona.description && persona.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePersonaClick = (personaId: string) => {
    navigate(`/persona-detail/${personaId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading personas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search personas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPersonas.map((persona) => (
          <Card 
            key={persona.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
            onClick={() => handlePersonaClick(persona.persona_id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-border rounded-lg">
                  <AvatarImage 
                    src={persona.profile_image_url || undefined} 
                    alt={persona.name}
                    className="object-cover rounded-lg"
                  />
                  <AvatarFallback className="bg-accent text-accent-foreground font-semibold rounded-lg text-lg">
                    {persona.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                    {persona.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    {persona.persona_data?.identity?.age && (
                      <span>Age {persona.persona_data.identity.age}</span>
                    )}
                    {persona.persona_data?.identity?.age && persona.persona_data?.identity?.occupation && (
                      <span>•</span>
                    )}
                    {persona.persona_data?.identity?.occupation && (
                      <span className="truncate">{persona.persona_data.identity.occupation}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {persona.description && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                    {persona.description.length > 120 ? `${persona.description.substring(0, 120)}...` : persona.description}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredPersonas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No personas found matching your search.' : 'No personas available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonaListV2;