/**
 * Utilities for generating initials and gradients for avatars
 */

/**
 * Generates initials from first and last name
 * Examples:
 * - "Max Mustermann" → "MM"
 * - "Bella" → "BE"
 * - "Maria" → "MA"
 */
export function generateInitials(firstName: string, lastName?: string | null): string {
  if (!firstName) return '?';

  const first = firstName.trim().charAt(0).toUpperCase();

  if (lastName && lastName.trim()) {
    const last = lastName.trim().charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  // For single names (pets, etc.), take first two letters
  const second = firstName.trim().charAt(1)?.toUpperCase() || '';
  return `${first}${second}`;
}

/**
 * Brand color gradients for initials avatars
 * These match the design system primary colors
 */
const GRADIENT_PRESETS = [
  // Primary brand gradient (default)
  'linear-gradient(135deg, hsl(var(--color-primary-500)) 0%, hsl(var(--color-primary-600)) 100%)',

  // Warm gradients
  'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
  'linear-gradient(135deg, #FF9A3D 0%, #FF7C1F 100%)',
  'linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)',

  // Cool gradients
  'linear-gradient(135deg, #4FC3F7 0%, #0288D1 100%)',
  'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
  'linear-gradient(135deg, #9575CD 0%, #7E57C2 100%)',

  // Neutral gradients
  'linear-gradient(135deg, #90A4AE 0%, #607D8B 100%)',
  'linear-gradient(135deg, #A1887F 0%, #8D6E63 100%)',
];

/**
 * Generates a consistent gradient based on initials
 * Same initials always get the same gradient
 */
export function generateGradient(initials: string): string {
  if (!initials) return GRADIENT_PRESETS[0];

  // Hash the initials to get a consistent index
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % GRADIENT_PRESETS.length;
  return GRADIENT_PRESETS[index];
}

/**
 * Generates inline style object for initials avatar
 */
export function getInitialsAvatarStyle(
  firstName: string,
  lastName?: string | null,
  size: number = 200
): React.CSSProperties {
  const initials = generateInitials(firstName, lastName);
  const gradient = generateGradient(initials);

  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'primary',
    fontSize: `${size * 0.4}px`, // 40% of size
    fontWeight: 700,
    lineHeight: 1,
    userSelect: 'none',
  };
}

/**
 * Generates Tailwind classes for initials avatar
 * For use with utility classes instead of inline styles
 */
export function getInitialsAvatarClasses(size: 'sm' | 'md' | 'lg' | 'xl'): string {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',    // 40px
    md: 'w-20 h-20 text-2xl',   // 80px
    lg: 'w-32 h-32 text-5xl',   // 128px
    xl: 'w-48 h-48 text-7xl',   // 192px
  };

  return `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-primary`;
}

/**
 * Gets contrasting text color for background
 * (For future use if custom colors are allowed)
 */
export function getContrastingTextColor(): 'primary' | 'black' {
  // Simple luminance calculation
  // For now, all our gradients use white text
  // This is a placeholder for future customization
  return 'primary';
}

/**
 * Validates if initials are valid (1-2 uppercase letters)
 */
export function areValidInitials(initials: string): boolean {
  return /^[A-Z]{1,2}$/.test(initials);
}
