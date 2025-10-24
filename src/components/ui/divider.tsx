import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className }) => {
  return (
    <div 
      className={cn(
        "self-stretch h-px border border-main rounded-sm",
        className
      )}
    />
  );
};