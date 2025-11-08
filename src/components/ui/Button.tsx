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
interface LoadingDotsProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative' | 'text';
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ variant }) => {
  // Variant-specific dot colors
  // User requested: blue dots for blue buttons, green dots for green buttons
  // Using lighter shades/opacity for visibility on colored backgrounds
  const dotColors = {
    // Primary: blue button - use lighter blue (primary-300) for visibility on blue background
    primary: 'bg-primary-300',
    // Positive: green button - use lighter green (green-300) for visibility on green background
    positive: 'bg-green-300',
    // Negative: red button - use lighter red for visibility
    negative: 'bg-red-300',
    // Neutral buttons: use neutral gray
    secondary: 'bg-neutral-500',
    tertiary: 'bg-neutral-500',
    text: 'bg-neutral-500'
  };

  const dotColor = dotColors[variant];

  return (
    <div className="flex items-center justify-center gap-1.5">
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full loading-dot',
          dotColor
        )}
      />
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full loading-dot',
          dotColor
        )}
      />
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full loading-dot',
          dotColor
        )}
      />
    </div>
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
        bg-interactive-secondary-default text-interactive-secondary-default
        hover:bg-interactive-secondary-hover
        active:bg-interactive-secondary-active
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
        hover:text-interactive-link-hover active:text-interactive-link-active
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
        {loading ? (
          <LoadingDots variant={variant} />
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