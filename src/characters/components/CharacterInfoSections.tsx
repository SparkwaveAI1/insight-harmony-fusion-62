
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Character } from '../types/characterTraitTypes';
import CharacterTraits from './CharacterTraits';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Character Type:</span>
              <span className="ml-2 capitalize">{character.character_type.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{formatDate(character.creation_date)}</span>
            </div>
            {character.age && (
              <div>
                <span className="font-medium">Age:</span>
                <span className="ml-2">{character.age}</span>
              </div>
            )}
            {character.gender && (
              <div>
                <span className="font-medium">Gender:</span>
                <span className="ml-2">{character.gender}</span>
              </div>
            )}
            {character.historical_period && (
              <div>
                <span className="font-medium">Historical Period:</span>
                <span className="ml-2">{character.historical_period}</span>
              </div>
            )}
            {character.region && (
              <div>
                <span className="font-medium">Region:</span>
                <span className="ml-2">{character.region}</span>
              </div>
            )}
            {character.social_class && (
              <div>
                <span className="font-medium">Social Class:</span>
                <span className="ml-2">{character.social_class}</span>
              </div>
            )}
            {character.species_type && (
              <div>
                <span className="font-medium">Species:</span>
                <span className="ml-2">{character.species_type}</span>
              </div>
            )}
            {character.origin_universe && (
              <div>
                <span className="font-medium">Origin Universe:</span>
                <span className="ml-2">{character.origin_universe}</span>
              </div>
            )}
            {character.form_factor && (
              <div>
                <span className="font-medium">Form Factor:</span>
                <span className="ml-2">{character.form_factor}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Modulation */}
      {character.behavioral_modulation && Object.keys(character.behavioral_modulation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Behavioral Modulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(character.behavioral_modulation).map(([trait, value]) => (
              <div key={trait}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{trait.replace(/_/g, ' ')}</span>
                  <span>{Math.round((value as number || 0) * 100)}%</span>
                </div>
                <Progress value={(value as number || 0) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Emotional Triggers */}
      {character.emotional_triggers && (
        <Card>
          <CardHeader>
            <CardTitle>Emotional Triggers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {character.emotional_triggers.positive_triggers && character.emotional_triggers.positive_triggers.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">Positive Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {character.emotional_triggers.positive_triggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {typeof trigger === 'string' ? trigger : String(trigger)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {character.emotional_triggers.negative_triggers && character.emotional_triggers.negative_triggers.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Negative Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {character.emotional_triggers.negative_triggers.map((trigger, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                      {typeof trigger === 'string' ? trigger : String(trigger)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Character Traits */}
      <CharacterTraits 
        traitProfile={character.trait_profile} 
        characterType={character.character_type}
      />

      {/* Linguistic Profile */}
      {character.linguistic_profile && (
        <Card>
          <CardHeader>
            <CardTitle>Linguistic Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(character.linguistic_profile, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CharacterInfoSections;
