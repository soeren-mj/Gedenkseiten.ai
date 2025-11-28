import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'empfehlung' | 'premium' | 'soon' | 'public' | 'private';

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
 * - premium: Blue (premium feature)
 * - soon: Neutral gray (coming soon)
 * - public: Green (public memorial)
 * - private: Neutral gray (private memorial)
 */
export const Badge: React.FC<BadgeProps> = ({ variant, children, className }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    empfehlung: 'chip-empfehlung',
    premium: 'chip-premium',
    soon: 'chip-soon',
    public: 'chip-public',
    private: 'chip-private',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 rounded-full text-body-xs-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
