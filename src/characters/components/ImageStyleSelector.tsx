
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ImageStyle {
  id: string;
  name: string;
  description: string;
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'photorealistic',
    name: 'Hyper',
    description: 'High-detail, realistic rendering'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie-style dramatic lighting and composition'
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese animation art style'
  },
  {
    id: 'comics',
    name: 'Comics',
    description: 'Comic book illustration style'
  }
];

interface ImageStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  disabled?: boolean;
  className?: string;
}

const ImageStyleSelector = ({ 
  selectedStyle, 
  onStyleChange, 
  disabled = false,
  className 
}: ImageStyleSelectorProps) => {
  const selectedStyleInfo = IMAGE_STYLES.find(style => style.id === selectedStyle);

  return (
    <div className={className}>
      <Label htmlFor="image-style" className="text-sm font-medium mb-2 block">
        Image Style
      </Label>
      <Select
        value={selectedStyle}
        onValueChange={onStyleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a style" />
        </SelectTrigger>
        <SelectContent>
          {IMAGE_STYLES.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{style.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {style.description}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedStyleInfo && (
        <p className="text-xs text-muted-foreground mt-2">
          <strong>{selectedStyleInfo.name}:</strong> {selectedStyleInfo.description}
        </p>
      )}
    </div>
  );
};

export default ImageStyleSelector;
