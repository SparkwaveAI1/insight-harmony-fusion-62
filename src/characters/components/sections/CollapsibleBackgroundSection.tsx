
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Character } from '../../types/characterTraitTypes';

interface CollapsibleBackgroundSectionProps {
  character: Character;
}

const CollapsibleBackgroundSection = ({ character }: CollapsibleBackgroundSectionProps) => {
  const traitProfile = character.trait_profile;
  
  if (!traitProfile?.background_story && !traitProfile?.description) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background</CardTitle>
      </CardHeader>
      <CardContent>
        {traitProfile.description && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-700">{traitProfile.description}</p>
          </div>
        )}
        {traitProfile.background_story && (
          <div>
            <h4 className="font-medium mb-2">Background Story</h4>
            <p className="text-sm text-gray-700">{traitProfile.background_story}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CollapsibleBackgroundSection;
