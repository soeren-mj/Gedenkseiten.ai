import React from 'react';
import { cn } from '@/lib/utils';

interface AddMemorialCardProps {
  /** Optional custom icon (React element). If not provided, uses default plus icon */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Description text below title */
  description: string;
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
    <svg
      className="w-8 h-8 text-tertiary group-hover:text-interactive-default transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
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
        "border-main",

        // Background
        "bg-transparent",

        // Transitions
        "transition-all duration-200",
        "cursor-pointer",
        "group",

        // Hover state
        "hover:border-hover",

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
      <div className="w-16 h-16 bg-secondary group-hover:bg-primary-600/10 rounded-full flex items-center justify-center mb-4 transition-colors">
        {icon || defaultIcon}
      </div>

      {/* Title */}
      <h4 className="mb-2 text-center">
        {title}
      </h4>

      {/* Description */}
      <p className="text-body-xs text-secondary text-center">
        {description}
      </p>
    </div>
  );
}
