import React from 'react';
import { cn } from '@/lib/utils';
import AddCircleIcon from '@/components/icons/AddCircleIcon';

interface AddMemorialCardProps {
  /** Optional custom icon (React element). If not provided, uses default plus icon */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Optional description text below title */
  description?: string;
  /** Click handler for the card */
  onClick: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * AddMemorialCard - Interactive card for creating new memorial pages
 *
 * Features:
 * - Size L: 247px × 247px (square)
 * - States: default, hover, focus
 * - Fully accessible with keyboard support
 * - Entire card is clickable
 */
export default function AddMemorialCard({
  icon,
  title,
  description,
  onClick,
  className,
}: AddMemorialCardProps) {
  // Handle keyboard interactions (Enter and Space)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Default plus icon
  const defaultIcon = (
    <AddCircleIcon className="w-10 h-10 transition-colors" />
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Fixed dimensions for square (size L)
        "w-[247px] h-[247px]",

        // Layout
        "flex flex-col items-center justify-center",
        "p-6",

        // Border - dashed default
        "border-2 border-dashed rounded-lg",
        "border-interactive-info",

        // Background
        "bg-interactive-info",

        // Transitions
        "transition-all duration-200",
        "cursor-pointer",
        "group",

        // Hover state
        "hover:border-interactive-info-hover",
        "hover:bg-interactive-info-hover",

        // Active state
        "active:scale-[0.98]",

        // Focus state - accessibility
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary-600",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-primary",

        className
      )}
    >
      {/* Icon container */}
      <div className="w-12 h-12 flex items-center justify-center transition-colors">
        {icon || defaultIcon}
      </div>

      {/* Title */}
      <h4 className="mb-2 text-center text-webapp-group text-bw max-w-[140px] leading-tight">
        {title}
      </h4>

      {/* Description */}
      {description && (
        <p className="text-body-xs text-secondary text-center">
          {description}
        </p>
      )}
    </div>
  );
}
