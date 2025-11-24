'use client';

import React from 'react';
import { generateInitials, generateGradient } from '@/lib/utils/initials';

interface InitialsPreviewProps {
  firstName: string;
  lastName?: string | null;
  size?: number; // in pixels
  className?: string;
  showBackground?: boolean; // Whether to show gradient background
}

/**
 * InitialsPreview Component
 *
 * Displays initials with gradient background
 *
 * Features:
 * - Auto-generates initials from names
 * - Consistent gradient based on initials
 * - Customizable size
 * - Circular shape
 */
export function InitialsPreview({
  firstName,
  lastName,
  size = 200,
  className = '',
  showBackground = true,
}: InitialsPreviewProps) {
  const initials = generateInitials(firstName, lastName);
  const gradient = generateGradient(initials);

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        text-webapp-title
        select-none
        ${showBackground ? 'text-bw' : 'text-interactive-default'}
        ${className}
      `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: showBackground ? gradient : 'transparent',
        fontSize: `${size * 0.4}px`,
        lineHeight: 1,
      }}
      aria-label={`Initialen: ${initials}`}
    >
      {initials}
    </div>
  );
}
