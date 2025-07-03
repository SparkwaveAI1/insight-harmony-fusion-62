
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Character } from '../../types/characterTraitTypes';

interface EnhancedTraitArchitectureSectionProps {
  character: Character;
}

const EnhancedTraitArchitectureSection = ({ character }: EnhancedTraitArchitectureSectionProps) => {
  const traitProfile = character.trait_profile;
  
  console.log('Enhanced Trait Architecture Section - trait profile:', traitProfile);
  
  if (!traitProfile) {
    console.log('No trait profile found for enhanced architecture section');
    return null;
  }

  // Check for enhanced trait architecture components
  const hasEnhancedArchitecture = traitProfile.core_motives || 
    traitProfile.latent_values || 
    traitProfile.symbolic_traits || 
    traitProfile.cognitive_filters;

  if (!hasEnhancedArchitecture) {
    console.log('No enhanced architecture components found');
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
        Enhanced Character Lab Trait Architecture
      </h2>
      
      {/* Core Motives */}
      {traitProfile.core_motives && traitProfile.core_motives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🎯 Core Motives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {traitProfile.core_motives.map((motive, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">{motive.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Intensity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={motive.intensity * 100} className="w-20" />
                      <span className="text-sm">{Math.round(motive.intensity * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{motive.narrative_description}</p>
                  {motive.failure_response && (
                    <p className="text-xs text-red-600"><strong>Failure Response:</strong> {motive.failure_response}</p>
                  )}
                  {motive.evolution_path && (
                    <p className="text-xs text-green-600"><strong>Evolution:</strong> {motive.evolution_path}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Latent Values */}
      {traitProfile.latent_values && traitProfile.latent_values.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              💎 Latent Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {traitProfile.latent_values.map((value, index) => (
              <div key={index} className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">{value.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Intensity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={value.intensity * 100} className="w-20" />
                      <span className="text-sm">{Math.round(value.intensity * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{value.narrative_description}</p>
                  {value.failure_response && (
                    <p className="text-xs text-red-600"><strong>Failure Response:</strong> {value.failure_response}</p>
                  )}
                  {value.evolution_path && (
                    <p className="text-xs text-green-600"><strong>Evolution:</strong> {value.evolution_path}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Symbolic Traits */}
      {traitProfile.symbolic_traits && traitProfile.symbolic_traits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🔮 Symbolic Traits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {traitProfile.symbolic_traits.map((trait, index) => (
              <div key={index} className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-green-800">{trait.name}</h4>
                  <Badge variant="outline" className="text-xs">{trait.type}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{trait.narrative_description}</p>
                  {trait.activation_context && (
                    <p className="text-xs text-orange-600"><strong>Activation:</strong> {trait.activation_context}</p>
                  )}
                  {trait.behavioral_effect && (
                    <p className="text-xs text-blue-600"><strong>Effect:</strong> {trait.behavioral_effect}</p>
                  )}
                  {trait.evolution_path && (
                    <p className="text-xs text-green-600"><strong>Evolution:</strong> {trait.evolution_path}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cognitive Filters */}
      {traitProfile.cognitive_filters && traitProfile.cognitive_filters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              🧠 Cognitive Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {traitProfile.cognitive_filters.map((filter, index) => (
              <div key={index} className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-amber-800">{filter.name}</h4>
                  <Badge variant="outline" className="text-xs">{filter.type}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{filter.narrative_description}</p>
                  {filter.activation_context && (
                    <p className="text-xs text-orange-600"><strong>Activation:</strong> {filter.activation_context}</p>
                  )}
                  {filter.behavioral_effect && (
                    <p className="text-xs text-blue-600"><strong>Effect:</strong> {filter.behavioral_effect}</p>
                  )}
                  {filter.evolution_path && (
                    <p className="text-xs text-green-600"><strong>Evolution:</strong> {filter.evolution_path}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTraitArchitectureSection;
