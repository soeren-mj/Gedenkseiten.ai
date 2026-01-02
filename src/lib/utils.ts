import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Extend twMerge to recognize custom font-size classes
// Without this, twMerge treats text-desktop-button-xs as a color class
// and removes it when text-interactive-disabled is added
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        // Desktop Headings
        'text-desktop-hero-h1',
        'text-desktop-section',
        'text-desktop-subsection',
        'text-desktop-title-body',
        'text-desktop-title-group',
        // Desktop Body
        'text-text-desktop-body-l',
        'text-text-desktop-body-m',
        'text-text-desktop-body-s',
        'text-text-desktop-body-xs',
        // Desktop Buttons
        'text-desktop-button-l',
        'text-desktop-button-m',
        'text-desktop-button-s',
        'text-desktop-button-xs',
        // Tablet
        'text-tablet-hero-h1',
        'text-tablet-section',
        'text-tablet-subsection',
        'text-tablet-title-body',
        'text-tablet-title-group',
        // Mobile
        'text-mobile-hero-h1',
        'text-mobile-section',
        'text-mobile-subsection',
        'text-mobile-title-body',
        'text-mobile-title-group',
        // Webapp
        'text-webapp-screen-title',
        'text-webapp-section-title',
        'text-webapp-subsection',
        'text-webapp-title-body',
        'text-webapp-group',
        // Special
        'text-desktop-tag',
        'text-desktop-chip',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or Date object to German format (DD.MM.YYYY)
 * @param date - The date to format (Date object, ISO string, or any valid date string)
 * @returns Formatted date string in DD.MM.YYYY format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()

  return `${day}.${month}.${year}`
}
