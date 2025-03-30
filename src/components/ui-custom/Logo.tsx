
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md', textClassName }) => {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/aec5484d-4b9b-4169-a74e-c3ceaf1a1d54.png" 
          alt="PersonaAI Logo" 
          className={`${sizeClasses[size]} object-contain`}
        />
      </div>
      <span className={cn("ml-2 font-medium text-xl", textClassName)}>
        Persona<span className="text-primary">AI</span>
      </span>
    </div>
  );
};

export default Logo;
