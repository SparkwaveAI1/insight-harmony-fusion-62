
import React from 'react';
import BasicInformationSection from './sections/BasicInformationSection';
import CollapsibleBackgroundSection from './sections/CollapsibleBackgroundSection';
import CommunicationSection from './sections/CommunicationSection';
import EmotionalTriggersSection from './sections/EmotionalTriggersSection';
import PhysicalManifestationSection from './sections/PhysicalManifestationSection';
import EntityProfileSection from './sections/EntityProfileSection';
import CharacterLabEnhancedSection from './sections/CharacterLabEnhancedSection';
import CharacterTraits from './CharacterTraits';
import { Character } from '../types/characterTraitTypes';
import EnhancedTraitArchitectureSection from './sections/EnhancedTraitArchitectureSection';

interface CharacterInfoSectionsProps {
  character: Character;
}

const CharacterInfoSections = ({ character }: CharacterInfoSectionsProps) => {
  const isCreativeCharacter = character.creation_source === 'creative';
  const isHistoricalCharacter = character.creation_source === 'historical';
  const isNonHumanoid = character.character_type === 'multi_species';
  const hasEnhancedTraitArchitecture = character.trait_profile?.core_motives;

  // Helper functions for BasicInformationSection
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getYearFromDate = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  const dateOfBirth = character.creation_date;
  const nonHumanoidTraitProfile = isNonHumanoid ? character.trait_profile : null;

  return (
    <div className="space-y-8">
      <BasicInformationSection 
        character={character}
        dateOfBirth={dateOfBirth}
        isNonHumanoid={isNonHumanoid}
        isHistorical={isHistoricalCharacter}
        nonHumanoidTraitProfile={nonHumanoidTraitProfile}
        formatDate={formatDate}
        getYearFromDate={getYearFromDate}
      />
      
      {/* ALWAYS show Character Traits for ALL Character Lab characters */}
      {isCreativeCharacter && character.trait_profile && (
        <CharacterTraits 
          traitProfile={character.trait_profile}
          characterType={character.character_type as 'historical' | 'fictional' | 'multi_species'}
        />
      )}
      
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
          <CommunicationSection character={character} isNonHumanoid={isNonHumanoid} />
          <EmotionalTriggersSection character={character} isNonHumanoid={isNonHumanoid} />
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
