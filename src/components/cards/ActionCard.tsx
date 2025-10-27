import React from 'react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  /** Icon to display (React element) */
  icon: React.ReactNode;
  /** Main title text */
  title: string;
  /** Description text below title */
  description: string;
  /** Click handler for the card */
  onClick: () => void;
  /** Visual variant of the card */
  variant?: 'default' | 'secondary';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * ActionCard - Interactive card for secondary actions in the dashboard
 *
 * Features:
 * - Fully clickable card surface
 * - States: default, hover, focus, active
 * - Keyboard accessible (Enter and Space)
 * - Two variants: default (white bg + border) and secondary (gray bg)
 * - Responsive layout
 */
export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  variant = 'default',
  className,
}: ActionCardProps) {
  // Handle keyboard interactions (Enter and Space)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Layout
        "flex flex-col items-center text-center",
        "p-6",
        "rounded-lg",

        // Transitions
        "transition-all duration-200",
        "cursor-pointer",
        "group",

        // Variant styles
        variant === 'secondary' && [
          "bg-transparent",
          "border border-card-inverted",
          "hover:bg-bw-opacity-40",
          "hover:shadow-sm",
        ],
        variant === 'default' && [
          "bg-secondary",
          "hover:bg-tertiary",
        ],

        // Focus state - accessibility
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-interactive-primary-default",
        "focus-visible:ring-offset-2",

        // Active state
        "active:scale-[0.98]",

        className
      )}
    >
      {/* Icon container */}
      <div className="w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>

      {/* Title */}
      <h4 className="text-desktop-body-l font-medium text-primary mb-2">
        {title}
      </h4>

      {/* Description */}
      <p className="text-body-xs text-secondary">
        {description}
      </p>
    </div>
  );
}
