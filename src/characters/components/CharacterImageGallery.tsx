
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Images, Trash2, Star, StarOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { 
  getCharacterImages, 
  setCurrentCharacterImage, 
  deleteCharacterImage,
  CharacterImage 
} from '../services/characterImageGalleryService';
import { updateCharacterWithImageUrl } from '../services/characterImageGalleryService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type AnyCharacter = Character | NonHumanoidCharacter;

interface CharacterImageGalleryProps {
  character: AnyCharacter;
  onCurrentImageChange?: (imageUrl: string) => void;
}

const CharacterImageGallery = ({ character, onCurrentImageChange }: CharacterImageGalleryProps) => {
  const [images, setImages] = useState<CharacterImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isNonHumanoid = 'species_type' in character;

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const characterImages = await getCharacterImages(character.character_id);
      setImages(characterImages);
    } catch (error) {
      console.error('Error loading character images:', error);
      toast.error('Failed to load character images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      loadImages();
    }
  }, [isDialogOpen, character.character_id]);

  const handleSetCurrent = async (imageId: string, imageUrl: string) => {
    try {
      const success = await setCurrentCharacterImage(character.character_id, imageId);
      if (success) {
        toast.success('Set as current image');
        setImages(prev => prev.map(img => ({ 
          ...img, 
          is_current: img.id === imageId 
        })));
        onCurrentImageChange?.(imageUrl);
      } else {
        toast.error('Failed to set as current image');
      }
    } catch (error) {
      console.error('Error setting current image:', error);
      toast.error('Failed to set as current image');
    }
  };

  const handleSetAsProfile = async (imageUrl: string) => {
    try {
      await updateCharacterWithImageUrl(character.character_id, imageUrl);
      toast.success('Set as profile image');
      onCurrentImageChange?.(imageUrl);
    } catch (error) {
      console.error('Error setting profile image:', error);
      toast.error('Failed to set as profile image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const success = await deleteCharacterImage(imageId);
      if (success) {
        toast.success('Image deleted');
        setImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Images className="h-4 w-4" />
          Image Gallery
          {images.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {images.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {character.name} - Image Gallery
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images saved yet</p>
            <p className="text-sm">Generate and save images to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden">
                <AspectRatio ratio={1}>
                  <img
                    src={image.storage_url}
                    alt={`${character.name} generated image`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', image.storage_url);
                    }}
                  />
                </AspectRatio>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {image.is_current && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={image.is_current ? "default" : "outline"}
                        onClick={() => handleSetCurrent(image.id, image.storage_url)}
                        disabled={image.is_current}
                        title="Set as current gallery image"
                      >
                        {image.is_current ? (
                          <Star className="h-3 w-3 fill-current" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetAsProfile(image.storage_url)}
                        title="Set as profile image"
                      >
                        <User className="h-3 w-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" title="Delete image">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteImage(image.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                  
                  {image.generation_prompt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {image.generation_prompt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CharacterImageGallery;
