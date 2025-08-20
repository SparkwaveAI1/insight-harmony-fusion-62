import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAllPersonas } from '@/services/persona';
import { DbPersona } from '@/services/persona';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePersonaSearch } from "@/hooks/usePersonaSearch";

interface PersonaListProps {
  searchQuery?: string;
  selectedTags?: string[];
  selectedAge?: string;
  selectedRegion?: string;
  selectedIncome?: string;
  selectedSourceType?: string;
  showPublicOnly?: boolean;
}

const PersonaList = ({ 
  searchQuery = "", 
  selectedTags = [], 
  selectedAge = "", 
  selectedRegion = "", 
  selectedIncome = "", 
  selectedSourceType = "",
  showPublicOnly = false 
}: PersonaListProps) => {
  const [personas, setPersonas] = useState<DbPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setIsLoading(true);
      const allPersonas = await getAllPersonas();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use enhanced search hook
  const searchedPersonas = usePersonaSearch(personas, searchQuery);
  
  // Apply additional filters
  const filteredPersonas = searchedPersonas.filter(persona => {
    // Filter by visibility
    if (showPublicOnly && !persona.is_public) return false;
    if (!showPublicOnly && persona.is_public) return false;
    
    // Filter by age
    if (selectedAge && persona.persona_data?.identity?.age) {
      const age = persona.persona_data.identity.age;
      switch (selectedAge) {
        case '18-25':
          if (age < 18 || age > 25) return false;
          break;
        case '26-35':
          if (age < 26 || age > 35) return false;
          break;
        case '36-50':
          if (age < 36 || age > 50) return false;
          break;
        case '51+':
          if (age < 51) return false;
          break;
      }
    }
    
    // Filter by region
    if (selectedRegion && persona.persona_data?.identity?.location?.country) {
      if (!persona.persona_data.identity.location.country.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by income
    if (selectedIncome && persona.persona_data?.identity?.socioeconomic_context?.income_level) {
      if (!persona.persona_data.identity.socioeconomic_context.income_level.toLowerCase().includes(selectedIncome.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

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
        <Button onClick={() => navigate('/create-persona')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Persona
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
                    <span className="ml-auto text-xs px-2 py-1 bg-accent rounded">
                      V3
                    </span>
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
            {searchQuery ? 'No personas found matching your search.' : 'No personas available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonaList;