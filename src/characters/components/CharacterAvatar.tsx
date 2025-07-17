
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterAvatarProps {
  character: {
    name: string;
    profile_image_url?: string | null;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CharacterAvatar = ({ character, size = 'md', className }: CharacterAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const fallbackSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {character.profile_image_url ? (
        <AvatarImage 
          src={character.profile_image_url} 
          alt={`${character.name} profile`}
          className="object-cover"
        />
      ) : (
        <AvatarFallback className="bg-primary/10 text-primary border-2 border-primary/20">
          {character.name ? (
            <span className="font-semibold text-sm">
              {character.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className={fallbackSizeClasses[size]} />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default CharacterAvatar;
