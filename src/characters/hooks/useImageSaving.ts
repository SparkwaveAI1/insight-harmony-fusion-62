
import { useState } from 'react';
import { toast } from 'sonner';
import { saveCharacterImage, updateCharacterWithImageUrl } from '../services/characterImageGalleryService';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

type AnyCharacter = Character | NonHumanoidCharacter;

export const useImageSaving = (character: AnyCharacter, onImageGenerated?: (imageUrl: string) => void) => {
  const [isSaving, setIsSaving] = useState(false);

  const saveToGallery = async (imageUrl: string, prompt: string) => {
    setIsSaving(true);
    try {
      const fileName = `${character.character_id}_${Date.now()}.png`;
      
      await saveCharacterImage(
        character.character_id,
        imageUrl,
        fileName,
        imageUrl,
        prompt,
        {},
        false
      );
      
      toast.success('Image saved to gallery!');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast.error('Failed to save image to gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const setAsProfile = async (imageUrl: string) => {
    setIsSaving(true);
    try {
      await updateCharacterWithImageUrl(character.character_id, imageUrl);
      
      toast.success('Image set as profile!');
      onImageGenerated?.(imageUrl);
    } catch (error) {
      console.error('Error setting as profile:', error);
      toast.error('Failed to set as profile image');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndSetAsProfile = async (imageUrl: string, prompt: string) => {
    setIsSaving(true);
    try {
      const fileName = `${character.character_id}_${Date.now()}.png`;
      
      await saveCharacterImage(
        character.character_id,
        imageUrl,
        fileName,
        imageUrl,
        prompt,
        {},
        true
      );
      
      await updateCharacterWithImageUrl(character.character_id, imageUrl);
      
      toast.success('Image saved to gallery and set as profile!');
      onImageGenerated?.(imageUrl);
    } catch (error) {
      console.error('Error saving and setting as profile:', error);
      toast.error('Failed to save and set as profile');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveToGallery,
    setAsProfile,
    saveAndSetAsProfile
  };
};
