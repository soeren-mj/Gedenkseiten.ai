import { cn } from '@/lib/utils';

interface SkeletonProps {
  /** CSS classes for customization */
  className?: string;
  /** Shape variant */
  variant?: 'circular' | 'rectangular' | 'text';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton - Generic loading placeholder component
 *
 * A reusable skeleton loader that follows the design system.
 * Automatically adapts to light/dark mode using semantic colors.
 *
 * Usage:
 * ```tsx
 * <Skeleton variant="circular" className="w-8 h-8" />
 * <Skeleton variant="text" className="h-4 w-24" />
 * <Skeleton variant="rectangular" className="h-20 w-full" />
 * ```
 *
 * Features:
 * - Theme-aware (uses bg-tertiary for automatic light/dark support)
 * - Multiple shape variants
 * - Configurable animation
 * - Fully customizable via className
 */
export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base styles - uses semantic color that adapts to theme
        'bg-tertiary',

        // Shape variants
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-sm',
        variant === 'text' && 'rounded-sm',

        // Animation
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',

        // Custom classes
        className
      )}
      aria-busy="true"
      aria-live="polite"
    />
  );
}
