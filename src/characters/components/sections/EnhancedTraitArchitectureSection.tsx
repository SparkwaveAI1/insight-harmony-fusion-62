
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Character } from '../../types/characterTraitTypes';
import { CoreMotive, LatentValue, SymbolicTrait, CognitiveFilter } from '../../types/creativeCharacterTypes';

interface EnhancedTraitArchitectureSectionProps {
  character: Character;
}

const EnhancedTraitArchitectureSection = ({ character }: EnhancedTraitArchitectureSectionProps) => {
  const traitProfile = character.trait_profile;
  
  // Only show for Character Lab characters with the new trait architecture
  if (!traitProfile || character.creation_source !== 'creative' || !traitProfile.core_motives) {
    return null;
  }

  const renderCoreMotives = (motives: CoreMotive[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          🎯 Core Motives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {motives.map((motive, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold capitalize text-blue-800">
                {motive.name.replace(/_/g, ' ')}
              </h4>
              <div className="flex items-center gap-3">
                <Progress value={motive.intensity * 100} className="w-24" />
                <span className="text-sm font-medium w-8">
                  {Math.round(motive.intensity * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{motive.narrative_description}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <strong className="text-red-700">Failure Response:</strong>
                <p className="text-gray-600 mt-1">{motive.failure_response}</p>
              </div>
              <div>
                <strong className="text-purple-700">Evolution Path:</strong>
                <p className="text-gray-600 mt-1">{motive.evolution_path}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderLatentValues = (values: LatentValue[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          💎 Latent Values
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {values.map((value, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold capitalize text-green-800">
                {value.name.replace(/_/g, ' ')}
              </h4>
              <div className="flex items-center gap-3">
                <Progress value={value.intensity * 100} className="w-24" />
                <span className="text-sm font-medium w-8">
                  {Math.round(value.intensity * 100)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{value.narrative_description}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <strong className="text-red-700">Failure Response:</strong>
                <p className="text-gray-600 mt-1">{value.failure_response}</p>
              </div>
              <div>
                <strong className="text-purple-700">Evolution Path:</strong>
                <p className="text-gray-600 mt-1">{value.evolution_path}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderSymbolicTraits = (traits: SymbolicTrait[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          🔮 Symbolic Traits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {traits.map((trait, index) => (
          <div key={index} className="border-l-4 border-purple-500 pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold capitalize text-purple-800">
                {trait.name.replace(/_/g, ' ')}
              </h4>
              <Badge variant="outline" className="text-xs">
                {trait.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">{trait.narrative_description}</p>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <div>
                <strong className="text-orange-700">Activation:</strong>
                <p className="text-gray-600 mt-1">{trait.activation_context}</p>
              </div>
              <div>
                <strong className="text-blue-700">Effect:</strong>
                <p className="text-gray-600 mt-1">{trait.behavioral_effect}</p>
              </div>
              <div>
                <strong className="text-purple-700">Evolution:</strong>
                <p className="text-gray-600 mt-1">{trait.evolution_path}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderCognitiveFilters = (filters: CognitiveFilter[]) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          🧠 Cognitive Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters.map((filter, index) => (
          <div key={index} className="border-l-4 border-orange-500 pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold capitalize text-orange-800">
                {filter.name.replace(/_/g, ' ')}
              </h4>
              <Badge variant="outline" className="text-xs">
                {filter.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">{filter.narrative_description}</p>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <div>
                <strong className="text-orange-700">Activation:</strong>
                <p className="text-gray-600 mt-1">{filter.activation_context}</p>
              </div>
              <div>
                <strong className="text-blue-700">Effect:</strong>
                <p className="text-gray-600 mt-1">{filter.behavioral_effect}</p>
              </div>
              <div>
                <strong className="text-purple-700">Evolution:</strong>
                <p className="text-gray-600 mt-1">{filter.evolution_path}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
        Enhanced Trait Architecture
      </h2>
      
      {traitProfile.core_motives && renderCoreMotives(traitProfile.core_motives)}
      {traitProfile.latent_values && renderLatentValues(traitProfile.latent_values)}
      {traitProfile.symbolic_traits && renderSymbolicTraits(traitProfile.symbolic_traits)}
      {traitProfile.cognitive_filters && renderCognitiveFilters(traitProfile.cognitive_filters)}
    </div>
  );
};

export default EnhancedTraitArchitectureSection;
