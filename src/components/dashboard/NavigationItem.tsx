'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface BadgeConfig {
  text: string;
  bgColor: string;
  textColor: string;
}

interface NavigationItemProps {
  /** Navigation target URL */
  href: string;
  /** Icon element (React Node) */
  icon: React.ReactNode;
  /** Label text */
  label: string;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Optional badge/chip configuration */
  badge?: BadgeConfig;
  /** Optional additional CSS classes */
  className?: string;
  /** Disabled state - not clickable, gray */
  disabled?: boolean;
  /** Empty state - content not filled yet, text-secondary color */
  isEmpty?: boolean;
  /** Minimized mode - only show icon with tooltip */
  minimized?: boolean;
}

/**
 * NavigationItem - Unified sidebar navigation component
 *
 * Features:
 * - Consistent layout with icon, label, and optional badge
 * - Multiple states: active, disabled, isEmpty, minimized
 * - Tooltip support for minimized mode
 * - Fully accessible with Next.js Link
 * - Smooth transitions
 *
 * States:
 * - active: Currently selected page (bg-bw)
 * - disabled: Not clickable (text-interactive-disabled, no hover)
 * - isEmpty: Content not filled (text-secondary, lighter color)
 * - minimized: Only icon visible, shows tooltip on hover
 */
export default function NavigationItem({
  href,
  icon,
  label,
  isActive,
  badge,
  className,
  disabled = false,
  isEmpty = false,
  minimized = false,
}: NavigationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine text color based on states
  const textColor = disabled
    ? 'text-interactive-disabled'
    : isEmpty
      ? 'text-secondary'
      : 'text-primary';

  // Determine if clickable
  const isClickable = !disabled;

  const content = (
    <div
      className={cn(
        // Layout
        "relative flex items-center gap-3 p-1 rounded-lg",
        "text-webapp-group",

        // Transitions
        "transition-colors duration-200",

        // State-based styling
        isActive && "bg-bw",
        !isActive && isClickable && "hover:bg-bw-opacity-60",
        disabled && "cursor-not-allowed",

        className
      )}
      onMouseEnter={() => minimized && setIsHovered(true)}
      onMouseLeave={() => minimized && setIsHovered(false)}
    >
      {/* Icon - fixed width for consistency */}
      <span className={cn(
        "w-8 h-8 flex items-center justify-center flex-shrink-0",
        textColor
      )}>
        {icon}
      </span>

      {/* Label - hidden when minimized */}
      {!minimized && (
        <span className={cn("text-webapp-group", textColor)}>
          {label}
        </span>
      )}

      {/* Optional Badge/Chip - hidden when minimized */}
      {!minimized && badge && (
        <span
          className="p-1 rounded-xs text-chip font-semibold"
          style={{
            backgroundColor: badge.bgColor,
            color: badge.textColor,
          }}
        >
          {badge.text}
        </span>
      )}

      {/* Tooltip for minimized mode */}
      {minimized && <Tooltip text={label} show={isHovered} />}
    </div>
  );

  // If disabled, return div instead of Link
  if (disabled) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
