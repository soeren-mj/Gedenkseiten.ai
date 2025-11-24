'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CircularIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon component to display inside the button */
  icon: React.ReactNode;
  /** Selected state */
  selected?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional label text below the button */
  label?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

/**
 * CircularIconButton Component
 *
 * A circular button with an icon, used for avatar selection and similar use cases.
 * Supports selected state and multiple sizes.
 */
export const CircularIconButton = React.forwardRef<HTMLButtonElement, CircularIconButtonProps>(
  ({ icon, selected = false, size = 'md', label, className, ...props }, ref) => {
    return (
      <div className="flex flex-col items-center gap-2 max-w-[86px] w-full">
        <button
          ref={ref}
          type="button"
          className={cn(
            // Base styles
            'rounded-full flex items-center justify-center',
            'border-[1.5px] transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-interactive-primary-default focus:ring-offset-2',

            // Size variant
            sizeClasses[size],

            // State styles
            selected
              ? 'bg-interactive-primary-default border-message-success text-interactive-default'
              : 'bg-bw-opacity-40 text-secondary border-transparent hover:border-hover hover:bg-inverted-primary',

            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-main disabled:hover:text-secondary',

            className
          )}
          {...props}
        >
          <span className={cn(iconSizeClasses[size])}>
            {icon}
          </span>
        </button>

        {/* Optional label */}
        {label && (
          <span
            className={cn(
              'text-center',
              selected ? 'font-semibold text-primary' : 'text-secondary'
            )}
            style={{
              fontSize: '1rem',
              fontWeight: selected ? 600 : 500,
              lineHeight: '175%',
              letterSpacing: '0.0175em'
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);

CircularIconButton.displayName = 'CircularIconButton';
