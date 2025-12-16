import React from 'react';
import { cn } from '@/lib/utils';
import AddCircleIcon from '@/components/icons/AddCircleIcon';

interface AddMemorialCardProps {
  /** Optional custom icon (React element). If not provided, uses default plus icon */
  icon?: React.ReactNode;
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
    <AddCircleIcon className="w-10 h-10 transition-colors text-link-default group-hover:text-link-hover" />
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Responsive square card
        "min-w-[247px] max-w-full aspect-square",

        // Layout
        "flex flex-col items-center justify-center",
        "p-1",

        // Border - dashed default
        "border border-dashed rounded-md",
        "border-interactive-default",

        // Background
        "bg-bw-opacity-40 backdrop-blur-sm",

        // Transitions
        "transition-all duration-200",
        "cursor-pointer",
        "group",

        // Hover state
        "hover:border-interactive-hover",

        // Focus state - accessibility
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary-600",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-primary",

        className
      )}
    >
      {/* Card content */}
      <div className="w-full h-full border border-dashed border-interactive-default group-hover:border-interactive-hover rounded-sm flex flex-col items-center justify-center">
      {/* Icon container */}
      <div className="w-12 h-12 flex items-center justify-center transition-colors">
        {icon || defaultIcon}
      </div>

      {/* Title */}
      <h4 className="text-body-s text-link-default group-hover:text-link-hover text-center transition-colors">
        Gedenkseite<br />hinzufügen
      </h4>
      </div>
    </div>
  );
}
