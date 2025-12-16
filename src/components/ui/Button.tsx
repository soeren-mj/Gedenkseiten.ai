import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// LoadingDots component with variant-specific colors
interface LoadingSpinnerProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'text';
}

/**
 * Loading Spinner Component
 * Shows a rotating spinner icon for button loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ variant }) => {
  // Color based on button variant - white for colored buttons, dark for neutral
  const spinnerColor = ['primary', 'positive', 'negative'].includes(variant)
    ? 'text-white'
    : 'text-neutral-600';

  return (
    <svg
      className={cn('animate-spin h-4 w-4', spinnerColor)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = `
      inline-flex items-center justify-between font-medium
      transition-all duration-200 focus:outline-none focus:ring-2
      focus:ring-offset-2 disabled:cursor-not-allowed
    `;

    // Variant styles using semantic tokens from design system
    // Note: disabled styles are conditionally applied in className to avoid affecting loading state
    const variantStyles = {
      primary: `
        bg-interactive-primary-default !text-interactive-default
        hover:bg-interactive-primary-hover active:bg-interactive-primary-active
        focus:ring-blue
      `,
      secondary: `
        bg-button-secondary-default !text-button-secondary-default
        hover:bg-button-secondary-hover
        active:bg-button-secondary-active
        focus:ring-blue
      `,
      tertiary: `
        bg-transparent text-primary border border-card-inverted
        hover:border hover:border-hover active:bg-secondary
        focus:ring-blue
      `,
      positive: `
        bg-interactive-positive-default text-interactive-positive-default
        hover:bg-interactive-positive-hover active:bg-interactive-positive-active
        focus:ring-green
      `,
      negative: `
        bg-interactive-error-default !text-interactive-error-default
        hover:bg-interactive-error-hover active:bg-interactive-error-active
        focus:ring-red
      `,
      text: `
        bg-transparent text-interactive-tertiary-text
        hover:text-link-hover active:text-link-active
        focus:ring-blue
      `
    };

    // Disabled styles (only applied when disabled=true and loading=false)
    const disabledStyles = {
      primary: 'bg-interactive-disabled text-interactive-disabled',
      secondary: 'bg-interactive-disabled text-interactive-disabled',
      tertiary: 'bg-transparent border-interactive-disabled text-interactive-disabled',
      positive: 'bg-interactive-disabled text-interactive-disabled',
      negative: 'bg-interactive-disabled text-interactive-disabled',
      text: 'text-interactive-disabled'
    };

    // Size styles based on design specs
    const sizeStyles = {
      xs: 'p-1 text-desktop-button-xs rounded-xxs',      // padding: 4px (p-1), border-radius: 8px
      sm: 'py-2.5 px-3 text-desktop-button-s rounded-xxs', // padding: 10px 12px, border-radius: 8px  
      md: 'py-3 px-5 text-desktop-button-m rounded-xs',    // padding: 12px 20px, border-radius: 12px
      lg: 'py-4 px-6 text-desktop-button-l rounded-sm'     // padding: 16px 24px, border-radius: 16px
    };

    // Width styles - full width only on mobile
    const widthStyles = fullWidth ? 'w-full sm:w-auto' : '';

    // Apply disabled styles only when disabled is true AND loading is false
    const shouldShowDisabledStyles = disabled && !loading;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          shouldShowDisabledStyles && disabledStyles[variant],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className="flex-grow flex items-center justify-center gap-2 mx-2">
          {loading && <LoadingSpinner variant={variant} />}
          <span>{children}</span>
        </span>
        {rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  label: string; // For accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'md', className, ...props }, ref) => {
    // Icon-specific padding adjustments
    const iconSizeStyles = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };

    return (
      <Button
        ref={ref}
        {...props}
        size={size}
        className={cn(iconSizeStyles[size], 'aspect-square', className)}
        aria-label={label}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Export default for backward compatibility
export default Button;