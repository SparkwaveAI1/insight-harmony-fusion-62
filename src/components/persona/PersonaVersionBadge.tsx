import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPersonaVersion } from '@/services/persona/utils/personaVersionCheck';

interface PersonaVersionBadgeProps {
  persona: any;
  className?: string;
}

export function PersonaVersionBadge({ persona, className }: PersonaVersionBadgeProps) {
  const version = getPersonaVersion(persona);
  
  if (version === 'unknown') return null;

  return (
    <Badge 
      variant={version === 'v2' ? 'default' : 'secondary'} 
      className={className}
    >
      {version.toUpperCase()}
    </Badge>
  );
}