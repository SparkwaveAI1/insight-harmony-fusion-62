
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Images, Check, X } from 'lucide-react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { getCharacterImages, CharacterImage } from '../services/characterImageGalleryService';

type AnyCharacter = Character | NonHumanoidCharacter;

interface ReferenceImageSelectorProps {
  character: AnyCharacter;
  selectedImageId?: string;
  onImageSelect: (image: CharacterImage | null) => void;
}

const ReferenceImageSelector = ({ 
  character, 
  selectedImageId, 
  onImageSelect 
}: ReferenceImageSelectorProps) => {
  const [images, setImages] = useState<CharacterImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const characterImages = await getCharacterImages(character.character_id);
      setImages(characterImages);
    } catch (error) {
      console.error('Error loading character images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, character.character_id]);

  const handleImageSelect = (image: CharacterImage) => {
    onImageSelect(image);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onImageSelect(null);
    setIsOpen(false);
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Reference Image (Optional)</label>
      
      {selectedImage && (
        <div className="border rounded-lg p-2 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearSelection}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <AspectRatio ratio={1} className="w-20">
            <img
              src={selectedImage.storage_url}
              alt="Reference"
              className="w-full h-full object-cover rounded"
            />
          </AspectRatio>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Images className="h-4 w-4 mr-2" />
            {selectedImage ? 'Change Reference' : 'Select Reference Image'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Reference Image</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No images in gallery yet</p>
              <p className="text-sm">Generate some images first to use as reference!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                  onClick={() => handleImageSelect(image)}
                >
                  <AspectRatio ratio={1}>
                    <img
                      src={image.storage_url}
                      alt="Reference option"
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(image.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="ghost">
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferenceImageSelector;
