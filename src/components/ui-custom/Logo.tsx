
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md', textClassName }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  // Calculate frame size based on logo size
  const frameClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className={`rounded-full bg-white p-1 flex items-center justify-center shadow-sm ${frameClasses[size]}`}>
          <div className="overflow-hidden flex items-center justify-center w-full h-full">
            <img 
              src="/lovable-uploads/d746ea4b-385a-4812-8505-d28e05739c9f.png" 
              alt="PersonaAI Logo" 
              className={`${sizeClasses[size]} object-contain`}
            />
          </div>
        </div>
      </div>
      <span className={cn("ml-2 font-medium text-xl", textClassName)}>
        Persona<span className="text-primary">AI</span>
      </span>
    </div>
  );
};

export default Logo;
