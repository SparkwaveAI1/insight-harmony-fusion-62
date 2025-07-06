
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Plus, Check } from "lucide-react";
import { Persona } from "@/services/persona/types";

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersonas: string[];
  onPersonaToggle: (personaId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const PersonaSelector = ({ 
  personas, 
  selectedPersonas, 
  onPersonaToggle,
  onLoadMore,
  hasMore = false,
  loading = false
}: PersonaSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {personas.map((persona) => {
          const isSelected = selectedPersonas.includes(persona.persona_id);
          
          return (
            <Card 
              key={persona.persona_id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onPersonaToggle(persona.persona_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={persona.profile_image_url} alt={persona.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{persona.name}</h4>
                      <div className="flex items-center gap-2">
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {persona.metadata?.age || 'N/A'} • {persona.metadata?.occupation || 'N/A'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {persona.metadata?.region || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Load More Personas'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonaSelector;
