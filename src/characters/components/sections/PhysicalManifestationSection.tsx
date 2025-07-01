
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom } from 'lucide-react';
import { NonHumanoidTraitProfile } from '../../types/nonHumanoidTypes';

interface PhysicalManifestationSectionProps {
  nonHumanoidTraitProfile: NonHumanoidTraitProfile;
}

const PhysicalManifestationSection = ({ nonHumanoidTraitProfile }: PhysicalManifestationSectionProps) => {
  const physicalManifestation = nonHumanoidTraitProfile.physical_manifestation;
  
  if (!physicalManifestation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5" />
          Physical Manifestation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-400">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {physicalManifestation.primary_form && (
              <div>
                <span className="font-medium text-purple-800">Primary Form:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.primary_form}
                </p>
              </div>
            )}
            {physicalManifestation.scale_category && (
              <div>
                <span className="font-medium text-purple-800">Scale:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.scale_category}
                </p>
              </div>
            )}
            {physicalManifestation.material_composition && (
              <div>
                <span className="font-medium text-purple-800">Material:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.material_composition}
                </p>
              </div>
            )}
            {physicalManifestation.dimensional_properties && (
              <div>
                <span className="font-medium text-purple-800">Dimensions:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.dimensional_properties}
                </p>
              </div>
            )}
            {physicalManifestation.luminescence_pattern && (
              <div>
                <span className="font-medium text-purple-800">Luminescence:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.luminescence_pattern}
                </p>
              </div>
            )}
            {physicalManifestation.texture_quality && (
              <div>
                <span className="font-medium text-purple-800">Texture:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.texture_quality}
                </p>
              </div>
            )}
            {physicalManifestation.movement_characteristics && (
              <div>
                <span className="font-medium text-purple-800">Movement:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.movement_characteristics}
                </p>
              </div>
            )}
            {physicalManifestation.environmental_interaction && (
              <div>
                <span className="font-medium text-purple-800">Environmental Effect:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.environmental_interaction}
                </p>
              </div>
            )}
            {physicalManifestation.sensory_emanations && (
              <div>
                <span className="font-medium text-purple-800">Sensory Output:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.sensory_emanations}
                </p>
              </div>
            )}
            {physicalManifestation.structural_complexity && (
              <div>
                <span className="font-medium text-purple-800">Structure:</span>
                <p className="text-purple-700 text-sm mt-1">
                  {physicalManifestation.structural_complexity}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhysicalManifestationSection;
