import React from 'react';
import BasicInformationSection from './sections/BasicInformationSection';
import CollapsibleBackgroundSection from './sections/CollapsibleBackgroundSection';
import CommunicationSection from './sections/CommunicationSection';
import EmotionalTriggersSection from './sections/EmotionalTriggersSection';
import PhysicalManifestationSection from './sections/PhysicalManifestationSection';
import EntityProfileSection from './sections/EntityProfileSection';
import CharacterLabEnhancedSection from './sections/CharacterLabEnhancedSection';
import { Character } from '../../types/characterTraitTypes';
import EnhancedTraitArchitectureSection from './sections/EnhancedTraitArchitectureSection';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  const isCreativeCharacter = character.creation_source === 'creative';
  const isHistoricalCharacter = character.creation_source === 'historical';
  const hasEnhancedTraitArchitecture = character.trait_profile?.core_motives;

  return (
    <div className="space-y-8">
      <BasicInformationSection character={character} />
      
      {/* Enhanced Trait Architecture - only for Character Lab characters with new architecture */}
      {isCreativeCharacter && hasEnhancedTraitArchitecture && (
        <EnhancedTraitArchitectureSection character={character} />
      )}
      
      {/* Character Lab Enhanced Section - for Character Lab characters without new architecture */}
      {isCreativeCharacter && !hasEnhancedTraitArchitecture && (
        <CharacterLabEnhancedSection character={character} />
      )}
      
      {/* Historical-specific sections */}
      {isHistoricalCharacter && (
        <>
          <CollapsibleBackgroundSection character={character} />
          <CommunicationSection character={character} />
          <EmotionalTriggersSection character={character} />
        </>
      )}
      
      {/* Non-humanoid physical manifestation */}
      {character.character_type === 'multi_species' && (
        <PhysicalManifestationSection character={character} />
      )}
      
      {/* Entity profile for creative characters */}
      {isCreativeCharacter && (
        <EntityProfileSection character={character} />
      )}
    </div>
  );
};

export default CharacterInfoSections;
