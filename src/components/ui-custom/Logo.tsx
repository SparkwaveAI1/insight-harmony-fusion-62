
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
      <div className="relative rounded-full bg-white shadow-sm overflow-hidden">
        <img 
          src="/lovable-uploads/928af4dd-ec22-412b-98e0-57d4f08eb4b2.png" 
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
