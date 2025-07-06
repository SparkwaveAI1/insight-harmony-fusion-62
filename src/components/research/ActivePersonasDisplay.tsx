
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { Persona } from "@/services/persona/types";

interface ActivePersonasDisplayProps {
  activePersonas: Persona[];
  className?: string;
}

const ActivePersonasDisplay = ({ activePersonas, className = "" }: ActivePersonasDisplayProps) => {
  if (activePersonas.length === 0) {
    return null;
  }

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Active Personas ({activePersonas.length})
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {activePersonas.map((persona) => (
            <div key={persona.persona_id} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
              <Avatar className="h-6 w-6">
                <AvatarImage src={persona.profile_image_url} alt={persona.name} />
                <AvatarFallback className="text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{persona.name}</span>
              <Badge variant="secondary" className="text-xs">
                {persona.metadata?.age || 'N/A'} • {persona.metadata?.occupation || 'N/A'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePersonasDisplay;
