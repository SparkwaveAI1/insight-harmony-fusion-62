
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateCharacterImage } from '../services/characterImageService';
import { saveCharacterImage, updateCharacterWithImageUrl, CharacterImage } from '../services/characterImageGalleryService';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import ImageStyleSelector from './ImageStyleSelector';
import ReferenceImageSelector from './ReferenceImageSelector';
import ImagePreviewDialog from './ImagePreviewDialog';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerateCharacterImageWithStyleButtonProps {
  character: AnyCharacter;
  onImageGenerated?: (imageUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const GenerateCharacterImageWithStyleButton = ({ 
  character, 
  onImageGenerated,
  variant = 'outline',
  size = 'default',
  className 
}: GenerateCharacterImageWithStyleButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [customText, setCustomText] = useState('');
  const [referenceImage, setReferenceImage] = useState<CharacterImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isNonHumanoid = 'species_type' in character;

  const handleGenerateImage = async () => {
    if (!character) {
      toast.error('No character data available');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info(`Generating ${isNonHumanoid ? 'entity' : 'character'} image...`, {
        description: `Using ${selectedStyle} style. This may take a few moments.`
      });
      
      // Prepare the generation data with custom text and reference image
      const generationData = {
        characterData: character,
        style: selectedStyle,
        customText: customText.trim(),
        referenceImageUrl: referenceImage?.storage_url
      };
      
      const result = await generateCharacterImage(generationData, selectedStyle, false); // false = don't auto-save
      
      // Handle both string and GenerationResult return types
      if (typeof result === 'object' && result && 'image_url' in result && result.image_url) {
        setGeneratedImageUrl(result.image_url);
        setGeneratedPrompt(result.prompt || '');
        setIsPreviewOpen(true);
        setIsDialogOpen(false);
        
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`);
      } else if (typeof result === 'string' && result) {
        // Handle legacy string return format
        setGeneratedImageUrl(result);
        setGeneratedPrompt('');
        setIsPreviewOpen(true);
        setIsDialogOpen(false);
        
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`);
      } else {
        toast.error('Failed to generate character image');
      }
    } catch (error) {
      console.error('Error generating character image:', error);
      toast.error('An error occurred while generating the image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    setIsSaving(true);
    try {
      // Extract filename from the data URL or create a unique one
      const fileName = `${character.character_id}_${Date.now()}.png`;
      
      await saveCharacterImage(
        character.character_id,
        generatedImageUrl,
        fileName,
        generatedImageUrl,
        generatedPrompt,
        {},
        false // Don't set as current
      );
      
      toast.success('Image saved to gallery!');
      setIsPreviewOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast.error('Failed to save image to gallery');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetAsProfile = async () => {
    setIsSaving(true);
    try {
      // Update character's profile image directly
      await updateCharacterWithImageUrl(character.character_id, generatedImageUrl);
      
      toast.success('Image set as profile!');
      onImageGenerated?.(generatedImageUrl);
      setIsPreviewOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error setting as profile:', error);
      toast.error('Failed to set as profile image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSetAsProfile = async () => {
    setIsSaving(true);
    try {
      // Extract filename from the data URL or create a unique one
      const fileName = `${character.character_id}_${Date.now()}.png`;
      
      // Save to gallery and set as current
      await saveCharacterImage(
        character.character_id,
        generatedImageUrl,
        fileName,
        generatedImageUrl,
        generatedPrompt,
        {},
        true // Set as current
      );
      
      // Also update character's profile image
      await updateCharacterWithImageUrl(character.character_id, generatedImageUrl);
      
      toast.success('Image saved to gallery and set as profile!');
      onImageGenerated?.(generatedImageUrl);
      setIsPreviewOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving and setting as profile:', error);
      toast.error('Failed to save and set as profile');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCustomText('');
    setReferenceImage(null);
    setGeneratedImageUrl('');
    setGeneratedPrompt('');
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {isNonHumanoid 
                  ? 'Create a visual representation of this non-humanoid entity based on its physical manifestation traits.'
                  : 'Generate a profile image for this character based on their traits and characteristics.'
                }
              </p>
            </div>
            
            <ImageStyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              disabled={isGenerating}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Description (Optional)</label>
              <Textarea
                placeholder="Add specific details to guide the image generation..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                disabled={isGenerating}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This will be combined with the character's existing traits
              </p>
            </div>
            
            <ReferenceImageSelector
              character={character}
              selectedImageId={referenceImage?.id}
              onImageSelect={setReferenceImage}
            />
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
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

export default GenerateCharacterImageWithStyleButton;
