
import React from 'react';
import { Save } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Persona } from '@/services/persona/types';

interface PersonaBadgeProps {
  persona: Persona;
  hasMessages: boolean;
  onSaveConversation: () => void;
}

const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  persona,
  hasMessages,
  onSaveConversation
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
      <Avatar className="w-12 h-12 rounded-full border-2 border-primary/20">
        {persona.profile_image_url ? (
          <AvatarImage src={persona.profile_image_url} alt={persona.name} />
        ) : (
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
            {persona.name.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div>
        <p className="font-medium">{persona.name}</p>
        <p className="text-xs text-muted-foreground">
          {persona.metadata?.occupation || ''} 
          {persona.metadata?.age && `, ${persona.metadata.age}`}
          {persona.metadata?.region && ` • ${persona.metadata.region}`}
        </p>
      </div>
      
      {hasMessages && (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={onSaveConversation}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      )}
    </div>
  );
};

export default PersonaBadge;
