
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
        <svg
          className={`${sizeClasses[size]}`}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Face outline */}
          <path
            d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Brain waves/data patterns */}
          <path
            d="M16 22C18.5 18 20 25 22.5 20C24.5 16 26 24 29 20C31.5 17 32 23 34 20"
            stroke="#33C3F0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <path
            d="M14 28C17 24 19 31 22 26C24.5 22 26 30 28.5 26C31 23 33 29 36 26"
            stroke="#FEF7CD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="ml-2 font-medium text-xl">
        Persona<span className="text-primary">AI</span>
      </span>
    </div>
  );
};

export default Logo;
