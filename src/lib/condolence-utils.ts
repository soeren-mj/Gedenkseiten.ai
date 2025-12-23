/**
 * Utility functions for the Kondolenzbuch feature
 */

import { CoverType, TextColor } from './supabase';

// Cover color presets with recommended text colors
export const COVER_COLORS = [
  { name: 'primary-50', hex: '#E8F1FF', defaultTextColor: 'black' as TextColor },
  { name: 'accent-blue', hex: '#0928F5', defaultTextColor: 'white' as TextColor },
  { name: 'purple-100', hex: '#F0ECFB', defaultTextColor: 'black' as TextColor },
  { name: 'purple-400', hex: '#B99BF6', defaultTextColor: 'black' as TextColor },
  { name: 'orange-100', hex: '#FBDECA', defaultTextColor: 'black' as TextColor },
  { name: 'orange-800', hex: '#8B4115', defaultTextColor: 'white' as TextColor },
  { name: 'accent-yellow', hex: '#EDDB16', defaultTextColor: 'black' as TextColor },
] as const;

// Cover preset images (stored in /public/kondolenzbuch-presets/)
export const COVER_PRESETS = [
  { name: 'kerzen', label: 'Kerzen', defaultTextColor: 'white' as TextColor },
  { name: 'blumen', label: 'Blumen', defaultTextColor: 'white' as TextColor },
  { name: 'natur', label: 'Natur', defaultTextColor: 'white' as TextColor },
  { name: 'himmel', label: 'Himmel', defaultTextColor: 'white' as TextColor },
  { name: 'ozean', label: 'Ozean', defaultTextColor: 'white' as TextColor },
  { name: 'wald', label: 'Wald', defaultTextColor: 'white' as TextColor },
] as const;

/**
 * Calculate the optimal text color (white or black) based on background luminance
 * Uses the relative luminance formula from WCAG guidelines
 */
export function calculateContrastColor(hexColor: string): TextColor {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance using the formula from WCAG 2.0
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Get the default text color for a cover type and value
 */
export function getDefaultTextColor(coverType: CoverType, coverValue: string): TextColor {
  switch (coverType) {
    case 'color': {
      const color = COVER_COLORS.find(c => c.hex === coverValue);
      if (color) return color.defaultTextColor;
      return calculateContrastColor(coverValue);
    }
    case 'preset': {
      const preset = COVER_PRESETS.find(p => p.name === coverValue);
      return preset?.defaultTextColor ?? 'white';
    }
    case 'custom':
      // For custom images, default to white (usually looks better on photos)
      return 'white';
    default:
      return 'white';
  }
}

/**
 * Get the URL for a cover preset image
 */
export function getPresetImageUrl(presetName: string): string {
  return `/kondolenzbuch-presets/${presetName}.jpg`;
}

/**
 * Fallback gradients for preset thumbnails when images are not available
 */
const PRESET_FALLBACK_GRADIENTS: Record<string, string> = {
  kerzen: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
  blumen: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  natur: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  himmel: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  ozean: 'linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)',
  wald: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
};

/**
 * Get fallback gradient for a preset when image is not available
 */
export function getPresetFallbackGradient(presetName: string): string {
  return PRESET_FALLBACK_GRADIENTS[presetName] || 'linear-gradient(135deg, #6b7280 0%, #374151 100%)';
}

/**
 * Get the background style for a cover
 * Uses fallback gradients for presets if images don't exist
 */
export function getCoverBackgroundStyle(
  coverType: CoverType,
  coverValue: string,
  useFallbackForPresets: boolean = true
): React.CSSProperties {
  switch (coverType) {
    case 'color':
      return { backgroundColor: coverValue };
    case 'preset':
      // Use fallback gradient by default (can be overridden when images exist)
      if (useFallbackForPresets) {
        return { background: getPresetFallbackGradient(coverValue) };
      }
      return {
        backgroundImage: `url(${getPresetImageUrl(coverValue)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    case 'custom':
      return {
        backgroundImage: `url(${coverValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    default:
      return {};
  }
}

/**
 * Generate a default cover title based on memorial name
 */
export function generateDefaultCoverTitle(firstName: string, lastName?: string | null): string {
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  return `In Erinnerung an ${fullName}`;
}

/**
 * Constants for entry validation
 */
export const ENTRY_MAX_CHARS = 2000;
export const ENTRY_MAX_IMAGES = 12;
export const IMAGE_MAX_SIZE_MB = 2;
export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate image file for upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Nur JPG, PNG und WebP Bilder sind erlaubt.',
    };
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Die Datei ist zu groß. Maximal ${IMAGE_MAX_SIZE_MB}MB erlaubt.`,
    };
  }

  return { valid: true };
}

/**
 * Format character count display
 */
export function formatCharCount(current: number, max: number = ENTRY_MAX_CHARS): string {
  return `${current}/${max}`;
}
