
import React from 'react';
import Card from '@/components/ui-custom/Card';
import PersonaTraits from '@/components/persona-details/PersonaTraits';
import PersonaDemographics from '@/components/persona-details/PersonaDemographics';
import PersonaEmotionalTriggers from '@/components/persona-details/PersonaEmotionalTriggers';
import { Character } from '../types/characterTraitTypes';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  return (
    <div className="space-y-8">
      {/* Demographics Section */}
      {character.metadata && (
        <Card className="p-6">
          <PersonaDemographics metadata={character.metadata} />
        </Card>
      )}

      {/* Comprehensive Traits Profile */}
      {character.trait_profile && (
        <Card className="p-6">
          <PersonaTraits traitProfile={character.trait_profile} />
        </Card>
      )}

      {/* Emotional Triggers */}
      {character.emotional_triggers && (
        <Card className="p-6">
          <PersonaEmotionalTriggers emotionalTriggers={character.emotional_triggers} />
        </Card>
      )}

      {/* Creation Prompt */}
      {character.prompt && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Creation Prompt</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {character.prompt}
          </p>
        </Card>
      )}

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Character Number:</span>{' '}
            <span className="text-muted-foreground">#{character.character_id.slice(-8).toUpperCase()}</span>
          </div>
          <div>
            <span className="font-medium">Character ID:</span>{' '}
            <span className="text-muted-foreground">{character.character_id}</span>
          </div>
          <div>
            <span className="font-medium">Type:</span>{' '}
            <span className="text-muted-foreground">{character.character_type}</span>
          </div>
          <div>
            <span className="font-medium">Created:</span>{' '}
            <span className="text-muted-foreground">
              {new Date(character.creation_date).toLocaleDateString()}
            </span>
          </div>
          {character.metadata?.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-muted-foreground mt-1">
                {character.metadata.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Character #</span>
            <span className="font-mono">#{character.character_id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Visibility</span>
            <span className={character.is_public ? 'text-green-600' : 'text-gray-600'}>
              {character.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Version</span>
            <span>{character.enhanced_metadata_version || 2}</span>
          </div>
          {character.trait_profile && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Trait Categories</span>
              <span>{Object.keys(character.trait_profile).length}</span>
            </div>
          )}
          {character.age && (
            <div className="flex flex-col">
              <span className="text-muted-foreground">Age</span>
              <span>{character.age}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CharacterInfoSections;
