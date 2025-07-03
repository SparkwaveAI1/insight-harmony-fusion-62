
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '../../types/characterTraitTypes';

interface EntityProfileSectionProps {
  character: Character;
}

const EntityProfileSection = ({ character }: EntityProfileSectionProps) => {
  const traitProfile = character.trait_profile;
  
  console.log('EntityProfileSection - trait profile:', traitProfile);
  
  if (!traitProfile) {
    console.log('No trait profile found in EntityProfileSection');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            🎭 Character Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No trait profile information available for this character.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          🎭 Character Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Entity Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Entity Details</h4>
            <div className="text-sm space-y-1">
              {traitProfile.entity_type && (
                <p><strong>Type:</strong> {traitProfile.entity_type}</p>
              )}
              {traitProfile.narrative_domain && (
                <p><strong>Domain:</strong> {traitProfile.narrative_domain}</p>
              )}
              {traitProfile.functional_role && (
                <p><strong>Role:</strong> {traitProfile.functional_role}</p>
              )}
              {traitProfile.environment && (
                <p><strong>Environment:</strong> {traitProfile.environment}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Communication & Form</h4>
            <div className="text-sm space-y-1">
              {traitProfile.communication_method && (
                <p><strong>Communication:</strong> {traitProfile.communication_method}</p>
              )}
              {traitProfile.physical_form && (
                <p><strong>Physical Form:</strong> {traitProfile.physical_form}</p>
              )}
              {traitProfile.change_response_style && (
                <p><strong>Change Style:</strong> {traitProfile.change_response_style}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {traitProfile.description && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Character Description</h4>
            <p className="text-sm text-gray-700">{traitProfile.description}</p>
          </div>
        )}

        {/* Core Drives */}
        {traitProfile.core_drives && traitProfile.core_drives.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Core Drives</h4>
            <div className="flex flex-wrap gap-2">
              {traitProfile.core_drives.map((drive, index) => (
                <Badge key={index} variant="default" className="bg-blue-100 text-blue-800">
                  {drive}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Surface Triggers */}
        {traitProfile.surface_triggers && traitProfile.surface_triggers.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Surface Triggers</h4>
            <div className="flex flex-wrap gap-2">
              {traitProfile.surface_triggers.map((trigger, index) => (
                <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Primary Ability */}
        {traitProfile.primary_ability && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">Primary Ability</h4>
            <p className="text-sm text-green-700">{traitProfile.primary_ability}</p>
          </div>
        )}

        {/* Core Purpose */}
        {traitProfile.core_purpose && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-1">Core Purpose</h4>
            <p className="text-sm text-amber-700">{traitProfile.core_purpose}</p>
          </div>
        )}

        {/* Key Activities */}
        {traitProfile.key_activities && traitProfile.key_activities.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Key Activities</h4>
            <div className="flex flex-wrap gap-2">
              {traitProfile.key_activities.map((activity, index) => (
                <Badge key={index} variant="outline">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Important Knowledge */}
        {traitProfile.important_knowledge && traitProfile.important_knowledge.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Important Knowledge</h4>
            <div className="flex flex-wrap gap-2">
              {traitProfile.important_knowledge.map((knowledge, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50">
                  {knowledge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Debug information */}
        <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <summary className="cursor-pointer font-mono text-gray-500">Debug: Available Trait Profile Fields</summary>
          <div className="mt-2 text-gray-600">
            <p>Available fields: {Object.keys(traitProfile).join(', ')}</p>
            <pre className="mt-2 text-xs overflow-auto max-h-40">
              {JSON.stringify(traitProfile, null, 2)}
            </pre>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default EntityProfileSection;
