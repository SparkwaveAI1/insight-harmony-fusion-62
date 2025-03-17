
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveProps {
  isActive: boolean;
  color?: string;
  className?: string;
  type?: 'speaking' | 'listening';
}

export const AudioWave = ({ 
  isActive, 
  color = 'bg-primary', 
  className,
  type = 'speaking'
}: AudioWaveProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Different animations based on whether AI is speaking or user is talking
  const barCount = type === 'speaking' ? 4 : 6;
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex items-center justify-center gap-[2px] h-6 transition-opacity',
        isActive ? 'opacity-100' : 'opacity-30',
        className
      )}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full transition-all duration-75',
            color,
            isActive ? 'animate-pulse' : 'h-2'
          )}
          style={{
            height: isActive 
              ? `${Math.max(8, Math.floor(Math.random() * 24))}px` 
              : '8px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  );
};
