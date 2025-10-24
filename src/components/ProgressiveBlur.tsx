// components/ProgressiveBlur.tsx - Apple's Progressive Blur Implementation
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveBlurProps {
  startPosition?: string;
  endPosition?: string;
  direction?: 'to bottom' | 'to top' | 'to left' | 'to right';
  children: React.ReactNode;
  className?: string;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  startPosition = '30%',
  endPosition = '95%',
  direction = 'to bottom',
  children,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Sharp top portion */}
      <div
        className="relative"
        style={{
          maskImage: `linear-gradient(${direction}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${startPosition}, rgba(0,0,0,0) ${endPosition})`,
          WebkitMaskImage: `linear-gradient(${direction}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${startPosition}, rgba(0,0,0,0) ${endPosition})`
        }}
      >
        {children}
      </div>
      
      {/* Blurred bottom portion - multiple layers for progressive effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: 'blur(3px)',
          WebkitFilter: 'blur(3px)',
          maskImage: `linear-gradient(${direction}, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${startPosition}, rgba(0,0,0,0.4) calc(${startPosition} + 10%), rgba(0,0,0,0.7) calc(${endPosition} - 10%), rgba(0,0,0,1) ${endPosition})`,
          WebkitMaskImage: `linear-gradient(${direction}, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${startPosition}, rgba(0,0,0,0.4) calc(${startPosition} + 10%), rgba(0,0,0,0.7) calc(${endPosition} - 10%), rgba(0,0,0,1) ${endPosition})`
        }}
      >
        {children}
      </div>
      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: 'blur(8px)',
          WebkitFilter: 'blur(8px)',
          maskImage: `linear-gradient(${direction}, rgba(0,0,0,0) 0%, rgba(0,0,0,0) calc(${startPosition} + 15%), rgba(0,0,0,0.5) calc(${startPosition} + 25%), rgba(0,0,0,1) ${endPosition})`,
          WebkitMaskImage: `linear-gradient(${direction}, rgba(0,0,0,0) 0%, rgba(0,0,0,0) calc(${startPosition} + 15%), rgba(0,0,0,0.5) calc(${startPosition} + 25%), rgba(0,0,0,1) ${endPosition})`
        }}
      >
        {children}
      </div>
    </div>
  );
};