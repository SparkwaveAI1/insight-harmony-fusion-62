
import React from 'react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidTraitProfile } from '../types/nonHumanoidTypes';
import CharacterTraits from './CharacterTraits';
import BasicInformationSection from './sections/BasicInformationSection';
import BackgroundSection from './sections/BackgroundSection';
import PhysicalManifestationSection from './sections/PhysicalManifestationSection';
import CommunicationSection from './sections/CommunicationSection';
import EntityProfileSection from './sections/EntityProfileSection';
import EmotionalTriggersSection from './sections/EmotionalTriggersSection';
import CharacterLabEnhancedSection from './sections/CharacterLabEnhancedSection';

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

  // Extract year from date of birth for historical characters
  const getYearFromDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      // Try to extract year from string format like "1790-01-01"
      const yearMatch = dateString.match(/(\d{4})/);
      return yearMatch ? yearMatch[1] : null;
    }
  };

  const isNonHumanoid = character.character_type === 'multi_species';
  const isHistorical = character.character_type === 'historical';
  const isCharacterLab = character.character_type === 'multi_species' && 
    character.metadata?.module === 'character_lab';
  
  // Type cast when we know it's a non-humanoid character
  const nonHumanoidTraitProfile = isNonHumanoid ? character.trait_profile as NonHumanoidTraitProfile : null;

  // Access date_of_birth and backstory from metadata
  const dateOfBirth = character.metadata?.date_of_birth;
  const backstory = character.metadata?.backstory || character.trait_profile?.backstory;

  return (
    <div className="space-y-6">
      {/* Enhanced Basic Information */}
      <BasicInformationSection
        character={character}
        dateOfBirth={dateOfBirth}
        isNonHumanoid={isNonHumanoid}
        isHistorical={isHistorical}
        nonHumanoidTraitProfile={nonHumanoidTraitProfile}
        formatDate={formatDate}
        getYearFromDate={getYearFromDate}
      />

      {/* Character Lab Enhanced Section - Show for Character Lab characters */}
      {isCharacterLab && (
        <CharacterLabEnhancedSection character={character} />
      )}

      {/* Background Section (replaces Emotional Triggers for historical characters) */}
      {isHistorical && backstory && (
        <BackgroundSection backstory={backstory} />
      )}

      {/* Physical Manifestation Section for Non-Humanoid Characters */}
      {isNonHumanoid && !isCharacterLab && nonHumanoidTraitProfile?.physical_manifestation && (
        <PhysicalManifestationSection nonHumanoidTraitProfile={nonHumanoidTraitProfile} />
      )}

      {/* Enhanced Communication Section for Non-Humanoid Characters */}
      {isNonHumanoid && !isCharacterLab && character.linguistic_profile && (
        <CommunicationSection character={character} isNonHumanoid={isNonHumanoid} />
      )}

      {/* Regular Linguistic Profile for Humanoid Characters */}
      {!isNonHumanoid && character.linguistic_profile && Object.keys(character.linguistic_profile).length > 0 && (
        <CommunicationSection character={character} isNonHumanoid={isNonHumanoid} />
      )}

      {/* Enhanced Metadata for Non-Humanoid Characters */}
      {isNonHumanoid && !isCharacterLab && character.metadata && Object.keys(character.metadata).length > 0 && (
        <EntityProfileSection character={character} />
      )}

      {/* Emotional Triggers - Only for Non-Historical Characters and not Character Lab */}
      {!isHistorical && !isCharacterLab && character.emotional_triggers && (
        <EmotionalTriggersSection character={character} isNonHumanoid={isNonHumanoid} />
      )}

      {/* Character Traits - Show for non-Character Lab characters or as fallback */}
      {!isCharacterLab && (
        <CharacterTraits 
          traitProfile={character.trait_profile} 
          characterType={character.character_type}
        />
      )}
    </div>
  );
};

export default CharacterInfoSections;
