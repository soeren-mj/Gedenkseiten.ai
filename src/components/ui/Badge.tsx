import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'empfehlung' | 'blue' | 'soon' | 'public' | 'private' | 'yellow' | 'orange';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

/**
 * Badge/Chip Component
 *
 * Reusable badge for labels like "Empfehlung", "Premium", "Öffentlich", "Privat".
 * Uses design system colors from globals.css.
 *
 * Variants:
 * - empfehlung: Purple (recommendation)
 * - blue: Blue (premium feature)
 * - soon: Neutral gray (coming soon)
 * - public: Green (public memorial)
 * - private: Neutral gray (private memorial)
 * - yellow: Yellow (warning)
 * - orange: Orange (hidden/verborgen)
 */
export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    empfehlung: 'chip-empfehlung',
    blue: 'chip-blue',
    soon: 'chip-soon',
    public: 'chip-green',
    private: 'chip-private',
    yellow: 'chip-yellow',
    orange: 'chip-orange',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 rounded-xs text-chip',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
