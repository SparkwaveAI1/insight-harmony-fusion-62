
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '../../types/characterTraitTypes';

interface PhysicalManifestationSectionProps {
  character: Character;
}

const PhysicalManifestationSection = ({ character }: PhysicalManifestationSectionProps) => {
  const traitProfile = character.trait_profile;
  
  if (!traitProfile?.physical_form && !traitProfile?.creative_manifestation) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Manifestation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {traitProfile.physical_form && (
          <div>
            <h4 className="font-medium mb-2">Primary Form</h4>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {traitProfile.physical_form}
            </Badge>
          </div>
        )}
        
        {traitProfile.creative_manifestation && (
          <div className="space-y-3">
            {traitProfile.creative_manifestation.primary_appearance && (
              <div>
                <span className="font-medium">Appearance:</span>
                <span className="ml-2 text-sm">{traitProfile.creative_manifestation.primary_appearance}</span>
              </div>
            )}
            {traitProfile.creative_manifestation.scale_reference && (
              <div>
                <span className="font-medium">Scale:</span>
                <span className="ml-2 text-sm">{traitProfile.creative_manifestation.scale_reference}</span>
              </div>
            )}
            {traitProfile.creative_manifestation.material_nature && (
              <div>
                <span className="font-medium">Material Nature:</span>
                <span className="ml-2 text-sm">{traitProfile.creative_manifestation.material_nature}</span>
              </div>
            )}
            {traitProfile.creative_manifestation.presence_aura && (
              <div>
                <span className="font-medium">Presence Aura:</span>
                <span className="ml-2 text-sm">{traitProfile.creative_manifestation.presence_aura}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhysicalManifestationSection;
