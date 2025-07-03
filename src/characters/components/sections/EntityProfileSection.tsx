
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { Character } from '../../types/characterTraitTypes';

interface EntityProfileSectionProps {
  character: Character;
}

const EntityProfileSection = ({ character }: EntityProfileSectionProps) => {
  if (!character.metadata || Object.keys(character.metadata).length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Entity Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {character.metadata.description && (
          <div>
            <span className="font-medium">Description:</span>
            <p className="mt-1 text-muted-foreground">{character.metadata.description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {character.metadata.narrative_domain && (
            <div>
              <span className="font-medium">Domain:</span>
              <Badge variant="outline" className="ml-2">{character.metadata.narrative_domain}</Badge>
            </div>
          )}
          {character.metadata.functional_role && (
            <div>
              <span className="font-medium">Role:</span>
              <Badge variant="outline" className="ml-2">{character.metadata.functional_role}</Badge>
            </div>
          )}
          {character.metadata.environment && (
            <div>
              <span className="font-medium">Environment:</span>
              <span className="ml-2 text-sm">{character.metadata.environment}</span>
            </div>
          )}
          {character.metadata.communication && (
            <div>
              <span className="font-medium">Native Communication:</span>
              <span className="ml-2 text-sm">{character.metadata.communication}</span>
            </div>
          )}
        </div>

        {character.metadata.core_drives && character.metadata.core_drives.length > 0 && (
          <div>
            <span className="font-medium">Core Drives:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {character.metadata.core_drives.map((drive: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {drive}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {character.metadata.surface_triggers && character.metadata.surface_triggers.length > 0 && (
          <div>
            <span className="font-medium">Behavioral Triggers:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {character.metadata.surface_triggers.map((trigger: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityProfileSection;
