
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Character } from '../../types/characterTraitTypes';

interface CharacterLabEnhancedSectionProps {
  character: Character;
}

const CharacterLabEnhancedSection = ({ character }: CharacterLabEnhancedSectionProps) => {
  const traitProfile = character.trait_profile;
  
  if (!traitProfile || character.character_type !== 'multi_species') {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
        Character Lab Enhanced Profile
      </h2>
      
      {/* Core Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            🎭 Core Identity & Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Entity Classification</h4>
              <div className="space-y-1">
                <p><strong>Type:</strong> {traitProfile.entity_type || 'Unknown'}</p>
                <p><strong>Domain:</strong> {traitProfile.narrative_domain || 'Contemporary'}</p>
                <p><strong>Role:</strong> {traitProfile.functional_role || 'Character'}</p>
                <p><strong>Environment:</strong> {traitProfile.environment || 'Unspecified'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Communication & Form</h4>
              <div className="space-y-1">
                <p><strong>Communication:</strong> {traitProfile.communication_method || 'Unknown'}</p>
                <p><strong>Physical Form:</strong> {traitProfile.physical_form || 'Not specified'}</p>
                <p><strong>Change Style:</strong> {traitProfile.change_response_style || 'Adaptive'}</p>
              </div>
            </div>
          </div>
          
          {traitProfile.description && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Character Description</h4>
              <p className="text-sm text-gray-700">{traitProfile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Core Drives & Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            ⚡ Core Drives & Surface Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Core Drives</h4>
              <div className="flex flex-wrap gap-2">
                {traitProfile.core_drives?.length ? 
                  traitProfile.core_drives.map((drive, index) => (
                    <Badge key={index} variant="default" className="bg-purple-100 text-purple-800">
                      {drive}
                    </Badge>
                  )) : 
                  <Badge variant="outline">No drives specified</Badge>
                }
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Surface Triggers</h4>
              <div className="flex flex-wrap gap-2">
                {traitProfile.surface_triggers?.length ? 
                  traitProfile.surface_triggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-800">
                      {trigger}
                    </Badge>
                  )) : 
                  <Badge variant="outline">No triggers specified</Badge>
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creative Personality Profile */}
      {traitProfile.creative_personality && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🌟 Creative Personality Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(traitProfile.creative_personality).map(([trait, value]) => (
                <div key={trait} className="flex items-center justify-between">
                  <span className="font-medium capitalize text-gray-700">
                    {trait.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3 w-48">
                    <Progress value={(value as number) * 100} className="flex-1" />
                    <span className="text-sm text-gray-600 w-8">
                      {Math.round((value as number) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Approach */}
      {traitProfile.decision_approach && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🎯 Decision-Making Approach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(traitProfile.decision_approach).map(([trait, value]) => (
                <div key={trait} className="flex items-center justify-between">
                  <span className="font-medium capitalize text-gray-700">
                    {trait.replace(/_/g, ' ')}
                  </span>
                  {typeof value === 'number' ? (
                    <div className="flex items-center gap-3 w-48">
                      <Progress value={value * 100} className="flex-1" />
                      <span className="text-sm text-gray-600 w-8">
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {String(value).replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Character Lab Models */}
      {(traitProfile.cognition_model || traitProfile.constraint_model || traitProfile.evolution_model || traitProfile.appearance_model) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🧠 Advanced Character Lab Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {traitProfile.cognition_model && Object.keys(traitProfile.cognition_model).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🧠 Cognition Model</h4>
                  <p className="text-sm text-blue-700">
                    Advanced cognitive processing patterns and thinking frameworks
                  </p>
                </div>
              )}
              
              {traitProfile.constraint_model && Object.keys(traitProfile.constraint_model).length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">⚖️ Constraint Model</h4>
                  <p className="text-sm text-orange-700">
                    Behavioral limitations and operational boundaries
                  </p>
                </div>
              )}
              
              {traitProfile.evolution_model && Object.keys(traitProfile.evolution_model).length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🌱 Evolution Model</h4>
                  <p className="text-sm text-green-700">
                    Adaptive learning and growth mechanisms
                  </p>
                </div>
              )}
              
              {traitProfile.appearance_model && Object.keys(traitProfile.appearance_model).length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">✨ Appearance Model</h4>
                  <p className="text-sm text-purple-700">
                    Physical manifestation and visual characteristics
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization History */}
      {(traitProfile.customization_applied || traitProfile.cloned_from) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🔄 Character Evolution History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {traitProfile.cloned_from && (
              <p className="text-sm text-gray-600">
                <strong>Cloned from:</strong> {traitProfile.cloned_from}
              </p>
            )}
            {traitProfile.customization_notes && (
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-1">Customization Notes:</p>
                <p className="text-sm text-amber-700">{traitProfile.customization_notes}</p>
              </div>
            )}
            {traitProfile.clone_timestamp && (
              <p className="text-xs text-gray-500">
                <strong>Created:</strong> {new Date(traitProfile.clone_timestamp).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CharacterLabEnhancedSection;
