
import React from 'react';
import EnhancedGenerateCharacterImageWithStyleButton from './EnhancedGenerateCharacterImageWithStyleButton';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerateCharacterImageWithStyleButtonProps {
  character: AnyCharacter;
  onImageGenerated?: (imageUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

// Wrapper component to maintain backward compatibility
const GenerateCharacterImageWithStyleButton = (props: GenerateCharacterImageWithStyleButtonProps) => {
  return <EnhancedGenerateCharacterImageWithStyleButton {...props} />;
};

export default GenerateCharacterImageWithStyleButton;
