
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className="rounded-full bg-white p-1 flex items-center justify-center shadow-sm">
          <img 
            src="/lovable-uploads/6e576833-6996-45f0-8cbf-9d884a7a7889.png" 
            alt="PersonaAI Logo" 
            className={`${sizeClasses[size]}`}
          />
        </div>
      </div>
      <span className="ml-2 font-medium text-xl">
        Persona<span className="text-primary">AI</span>
      </span>
    </div>
  );
};

export default Logo;
