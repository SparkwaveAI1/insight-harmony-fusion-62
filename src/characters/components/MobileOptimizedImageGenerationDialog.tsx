
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImageIcon, Wifi, WifiOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CharacterImage } from '../services/characterImageGalleryService';
import ImageStyleSelector from './ImageStyleSelector';
import ReferenceImageSelector from './ReferenceImageSelector';

type AnyCharacter = Character | NonHumanoidCharacter;

interface MobileOptimizedImageGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: AnyCharacter;
  isGenerating: boolean;
  isNonHumanoid: boolean;
  isAuthenticated: boolean;
  onGenerate: (style: string, customText: string, referenceImage: CharacterImage | null) => void;
}

const MobileOptimizedImageGenerationDialog = ({
  isOpen,
  onClose,
  character,
  isGenerating,
  isNonHumanoid,
  isAuthenticated,
  onGenerate
}: MobileOptimizedImageGenerationDialogProps) => {
  const [selectedStyle, setSelectedStyle] = useState('profile');
  const [customText, setCustomText] = useState('profile image, realistic portrait');
  const [referenceImage, setReferenceImage] = useState<CharacterImage | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [progress, setProgress] = useState(0);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Progress simulation for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't go to 100% until actually complete
          return prev + Math.random() * 5;
        });
      }, 500);
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const handleGenerate = () => {
    if (!isOnline) {
      return; // Prevent generation when offline
    }
    onGenerate(selectedStyle, customText, referenceImage);
  };

  const resetForm = () => {
    setCustomText('profile image, realistic portrait');
    setReferenceImage(null);
    setProgress(0);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Network Status Alert */}
          {!isOnline && (
            <Alert className="border-amber-200 bg-amber-50">
              <WifiOff className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                No internet connection. Image generation is not available offline.
              </AlertDescription>
            </Alert>
          )}

          {/* Authentication Status Alert */}
          {!isAuthenticated && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Please sign in to generate images for your characters.
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating image...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                This may take up to 30 seconds. Please keep this window open.
              </p>
            </div>
          )}

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
            disabled={isGenerating || !isOnline || !isAuthenticated}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Description</label>
            <Textarea
              placeholder="Add specific details to guide the image generation..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isGenerating || !isOnline || !isAuthenticated}
              rows={3}
              className="resize-none" // Better for mobile
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
              onClick={handleGenerate}
              disabled={isGenerating || !isOnline || !isAuthenticated}
              className="flex-1 min-h-[44px]" // Better touch target
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
              onClick={handleClose}
              disabled={isGenerating}
              className="min-h-[44px]" // Better touch target
            >
              {isGenerating ? 'Close' : 'Cancel'}
            </Button>
          </div>

          {/* Network Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileOptimizedImageGenerationDialog;
