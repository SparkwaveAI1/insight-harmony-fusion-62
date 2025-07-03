
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { useImageGenerationWithAuth } from '../hooks/useImageGenerationWithAuth';
import { useImageSaving } from '../hooks/useImageSaving';
import MobileOptimizedImageGenerationDialog from './MobileOptimizedImageGenerationDialog';
import ImagePreviewDialog from './ImagePreviewDialog';

type AnyCharacter = Character | NonHumanoidCharacter;

interface EnhancedGenerateCharacterImageWithStyleButtonProps {
  character: AnyCharacter;
  onImageGenerated?: (imageUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const EnhancedGenerateCharacterImageWithStyleButton = ({ 
  character, 
  onImageGenerated,
  variant = 'outline',
  size = 'default',
  className 
}: EnhancedGenerateCharacterImageWithStyleButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    isGenerating,
    generatedImageUrl,
    generatedPrompt,
    generateImage,
    resetGeneration,
    isNonHumanoid,
    isAuthenticated
  } = useImageGenerationWithAuth(character);

  const {
    isSaving,
    saveToGallery,
    setAsProfile,
    saveAndSetAsProfile
  } = useImageSaving(character, onImageGenerated);

  const handleGenerate = async (selectedStyle: string, customText: string, referenceImage: any) => {
    const success = await generateImage(selectedStyle, customText, referenceImage);
    if (success) {
      setIsPreviewOpen(true);
      setIsDialogOpen(false);
    }
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    resetGeneration();
  };

  const handleSaveToGallery = () => saveToGallery(generatedImageUrl, generatedPrompt);
  const handleSetAsProfile = () => setAsProfile(generatedImageUrl);
  const handleSaveAndSetAsProfile = () => saveAndSetAsProfile(generatedImageUrl, generatedPrompt);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} min-h-[44px]`} // Better touch target for mobile
        onClick={() => setIsDialogOpen(true)}
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
      </Button>

      <MobileOptimizedImageGenerationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        character={character}
        isGenerating={isGenerating}
        isNonHumanoid={isNonHumanoid}
        isAuthenticated={isAuthenticated}
        onGenerate={handleGenerate}
      />

      <ImagePreviewDialog
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        imageUrl={generatedImageUrl}
        character={character}
        prompt={generatedPrompt}
        onSaveToGallery={handleSaveToGallery}
        onSetAsProfile={handleSetAsProfile}
        onSaveAndSetAsProfile={handleSaveAndSetAsProfile}
        isSaving={isSaving}
      />
    </>
  );
};

export default EnhancedGenerateCharacterImageWithStyleButton;
