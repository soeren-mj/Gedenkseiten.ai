import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

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
    const variantStyles = {
      primary: `
        bg-interactive-primary-default !text-interactive-default
        hover:bg-interactive-primary-hover active:bg-interactive-primary-active
        focus:ring-blue
        disabled:bg-interactive-disabled disabled:text-interactive-disabled
      `,
      secondary: `
        bg-interactive-secondary-default text-interactive-secondary-default
        hover:bg-interactive-secondary-hover
        active:bg-interactive-secondary-active
        focus:ring-blue
        disabled:bg-interactive-disabled disabled:text-interactive-disabled
      `,
      tertiary: `
        bg-transparent text-primary border border-transparent
        hover:border hover:border-hover active:bg-secondary
        focus:ring-blue
        disabled:bg-interactive-disabled disabled:text-interactive-disabled
      `,
      positive: `
        bg-interactive-positive-default text-interactive-positive-default
        hover:bg-interactive-positive-hover active:bg-interactive-positive-active
        focus:ring-green
        disabled:bg-interactive-disabled disabled:text-interactive-disabled
      `,
      negative: `
        bg-interactive-error-default text-interactive-error-default
        hover:bg-interactive-error-hover active:bg-interactive-error-active
        focus:ring-red
        disabled:bg-interactive-disabled disabled:text-interactive-disabled
      `
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

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Laden...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0">{leftIcon}</span>
            )}
           <span className="flex-grow text-center mx-2">{children}</span>
           {rightIcon && (
             <span className="flex-shrink-0">{rightIcon}</span>
            )}
          </>
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