# Gedenkseiten.ai Button Component Documentation

## Overview
Buttons are the primary interactive elements in Gedenkseiten.ai, designed to guide users through memorial creation and interaction flows. This documentation provides comprehensive implementation guidelines for all button variants, states, and use cases.

---

## Button Variants

### 1. Primary Button
**Purpose**: Main call-to-action buttons for primary user flows  
**Use Cases**: "Jetzt starten", "Fertig", "Gedenkseite anlegen", "Weiter"

```typescript
// TypeScript Interface
interface PrimaryButtonProps {
  variant: 'primary';
  size: 'xs' | 'sm' | 'md' | 'lg';
  state?: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS Implementation**:
```css
.btn-primary {
  @apply bg-interactive-primary-default text-interactive-primary-default
         hover:bg-interactive-primary-hover active:bg-interactive-primary-active
         disabled:bg-interactive-primary-disabled disabled:text-interactive-primary-disabled
         transition-colors duration-200;
}
```

### 2. Secondary Button
**Purpose**: Secondary actions that complement primary actions  
**Use Cases**: "Überspringen", "Einloggen" next to "Signup"

```typescript
interface SecondaryButtonProps {
  variant: 'secondary';
  size: 'xs' | 'sm' | 'md' | 'lg';
  state?: 'default' | 'hover' | 'active' | 'disabled';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS Implementation**:
```css
.btn-secondary {
  @apply bg-button-secondary-default
         text-button-secondary-default
         hover:bg-button-secondary-hover
         active:bg-button-secondary-active
         disabled:bg-interactive-primary-disabled disabled:text-interactive-primary-disabled
         transition-all duration-200;
}
```

### 3. Tertiary Button
**Purpose**: Low-emphasis actions with transparent background  
**Use Cases**: "Weitere Felder hinzufügen", "Mehr anzeigen", "Details", Links, "Abbrechen", "Zurück", "Weitere Optionen"

```typescript
interface TertiaryButtonProps {
  variant: 'tertiary';
  size: 'xs' | 'sm' | 'md' | 'lg';
  state?: 'default' | 'hover' | 'active' | 'disabled';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS Implementation**:
```css
.btn-tertiary {
  @apply bg-transparent text-primary
         hover:bg-secondary 
         active:bg-secondary active:text-accent
         disabled:bg-interactive-primary-disabled disabled:text-interactive-primary-disabled
         transition-colors duration-200;
}
```

### 4. Positive Button
**Purpose**: Confirmation and success actions  
**Use Cases**: "Freigeben", "Bestätigen", "Speichern", "Annehmen"

```typescript
interface PositiveButtonProps {
  variant: 'positive';
  size: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS Implementation**:
```css
.btn-positive {
  @apply bg-interactive-positive-default text-interactive-positive-default
         hover:bg-interactive-positive-hover 
         active:bg-interactive-positive-active
                  disabled:bg-interactive-primary-disabled disabled:text-interactive-primary-disabled
         transition-colors duration-200;
}
```

### 5. Negative/Destructive Button
**Purpose**: Destructive actions requiring caution  
**Use Cases**: "Löschen", "Ablehnen", "Entfernen", "Verwerfen"

```typescript
interface NegativeButtonProps {
  variant: 'negative' | 'destructive';
  size: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS Implementation**:
```css
.btn-negative {
  @apply bg-interactive-error-default text-interactive-error-default
         hover:bg-interactive-error-hover 
         active:bg-interactive-error-active
                  disabled:bg-interactive-primary-disabled disabled:text-interactive-primary-disabled
         transition-colors duration-200;
}
```

---

## Button Sizes

### Size Specifications

| Size | Typography Token | Padding (Y, X) | Border Radius | Use Case |
|------|-----------------|--------|----------------|---------------|----------|
| `xs` | Desktop-Button-XS | 4px, 4px | border-radius-xxs (8px) | Inline actions, compact spaces |
| `sm` | Desktop-Button-S | 10px, 12px | border-radius-xxs (8px) | Secondary actions, forms |
| `md` | Desktop-Button-M | 12px, 20px | border-radius-xs (12px) | Standard actions, primary CTAs |
| `lg` | Desktop-Button-L | 16px, 24px | border-radius-sm (16px) | Hero CTAs, prominent actions |

### Size Implementation
```tsx
// Button size classes
const sizeClasses = {
  xs: 'p-1 desktop-button-xs rounded-xxs',  // Desktop-Button-XS
  sm: 'py-2.5 px-3 desktop-button-s rounded-xxs',   // Desktop-Button-S
  md: 'py-3 px-5 desktop-button-m rounded-xs',  // Desktop-Button-M
  lg: 'py4 px-6 desktop-button-l rounded-sm' // Desktop-Button-L
};
```

---

## Button States

### 1. Default State
Normal resting state of the button - base colors as defined above.

### 2. Hover State
Activated on mouse hover - uses semantic hover color tokens.
```css
hover:bg-interactive-[variant]-hover
```

### 3. Active/Pressed State
When button is being clicked - uses semantic active color tokens.
```css
active:bg-interactive-[variant]-active
```

### 4. Disabled State
Non-interactive state - consistent across all variants.
```css
disabled:bg-interactive-primary-disabled
disabled:text-interactive-primary-disabled
disabled:cursor-not-allowed
```

### 5. Loading State
Shows spinner while processing.
```tsx
{isLoading ? (
  <div className="flex items-center justify-center">
    <Spinner className="mr-2" />
    <span>Laden...</span>
  </div>
) : children}
```

---

## Complete React Component Implementation

```tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Utility for className merging

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'positive' | 'negative';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
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
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 focus:outline-none focus:ring-2
    focus:ring-offset-2 disabled:cursor-not-allowed
  `;

  // Variant styles using semantic tokens
  const variantStyles = {
    primary: `
      bg-interactive-primary-default text-interactive-primary-default
      hover:bg-interactive-primary-hover active:bg-interactive-primary-active
      focus:ring-accent-blue
      disabled:bg-interactive-primary-disabled disabled:text-interactive-disabled
    `,
    secondary: `
      bg-button-secondary-default border-2 border-button-secondary-border
      text-button-secondary-text
      hover:bg-button-secondary-hover hover:border-button-secondary-hover-border
      active:bg-button-secondary-active active:border-button-secondary-active-border
      focus:ring-accent-blue
      disabled:bg-button-secondary-disabled disabled:border-button-secondary-disabled-border
      disabled:text-interactive-disabled
    `,
    tertiary: `
      bg-transparent text-interactive-tertiary-text
      hover:bg-interactive-tertiary-hover active:bg-interactive-tertiary-active
      focus:ring-accent-blue
      disabled:text-interactive-disabled
    `,
    positive: `
      bg-interactive-positive-default text-interactive-positive-text
      hover:bg-interactive-positive-hover active:bg-interactive-positive-active
      focus:ring-accent-green
      disabled:bg-interactive-primary-disabled disabled:text-interactive-disabled
    `,
    negative: `
      bg-interactive-error-default text-interactive-error-text
      hover:bg-interactive-error-hover active:bg-interactive-error-active
      focus:ring-accent-red
      disabled:bg-interactive-primary-disabled disabled:text-interactive-disabled
    `
  };

  // Size styles based on design specs
  const sizeClasses = {
  xs: 'p-1 desktop-button-xs rounded-xxs',      // padding: 4px (p-1), border-radius: 8px
  sm: 'py-2.5 px-3 desktop-button-s rounded-xxs', // padding: 10px 12px, border-radius: 8px  
  md: 'py-3 px-5 desktop-button-m rounded-xs',    // padding: 12px 20px, border-radius: 12px
  lg: 'py-4 px-6 desktop-button-l rounded-sm'     // padding: 16px 24px, border-radius: 16px
};

  // Width styles - full width only on mobile
  const widthStyles = fullWidth ? 'w-full sm:w-auto' : '';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {rightIcon && !loading && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};
```

---

## Icon Buttons

For buttons with only icons (no text):

```tsx
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string; // For accessibility
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'md',
  ...props
}) => {
  const iconSizeStyles = {
    xs: 'p-1.5',
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3'
  };

  return (
    <Button
      {...props}
      size={size}
      className={cn(iconSizeStyles[size], props.className)}
      aria-label={label}
    >
      {icon}
    </Button>
  );
};
```

---

## Special Button Types

### 1. Social Login Buttons
```tsx
const SocialButton = ({ provider, children, ...props }) => {
  const socialStyles = {
    google: 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50',
    apple: 'bg-black text-white hover:bg-neutral-900',
    microsoft: 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
  };

  return (
    <Button
      {...props}
      className={cn(socialStyles[provider], 'border', props.className)}
    >
      {children}
    </Button>
  );
};

// Usage
<SocialButton provider="google" size="lg" fullWidth>
  <GoogleIcon className="mr-2" />
  Mit Google fortfahren
</SocialButton>
```

### 2. Floating Action Button (FAB)
```tsx
<button className="fixed bottom-6 right-6 p-4 bg-interactive-primary-default 
                   text-interactive-default rounded-full shadow-lg 
                   hover:bg-interactive-primary-hover 
                   focus:outline-none focus:ring-2 focus:ring-accent-blue">
  <PlusIcon className="h-6 w-6" />
</button>
```

### 3. Button Groups
```tsx
<div className="inline-flex rounded-xs shadow-sm" role="group">
  <Button variant="secondary" className="rounded-r-none">
    Vorheriges
  </Button>
  <Button variant="secondary" className="rounded-l-none -ml-px">
    Nächstes
  </Button>
</div>
```

---

## Global CSS Setup

To use semantic tokens, configure your global CSS:

```css
:root {
    /* Background colors */
    --background-bw: #FFFFFF;
    --background-primary: #F0F0F2;
    --background-secondary: #E0E1E5;
    --background-tertiary: #D2D3D9;
    --background-inverted: #000000;
    --background-accent: #9AB6FD;
    --background-interactive-primary-default: #0928F5;
    --background-interactive-primary-hover: #0822CC;
    --background-interactive-primary-active: #031AA8;
    --background-interactive-primary-disabled: #E0E1E5;
    --background-interactive-info: #DAE8FF;
    --background-interactive-positive-default: #1E9B4C;
    --background-interactive-positive-hover: #1B7A3E;
    --background-interactive-positive-active: #1A6134;
    --background-interactive-error-default: #A01417;
    --background-interactive-error-hover: #84181A;
    --background-interactive-error-active: #480708;

    /* Foreground colors */
    --foreground-bw: #000000;
    --foreground-primary: #2F2F30;
    --foreground-secondary: #636573;
    --foreground-tertiary: #8B8FA5;
    --foreground-accent: #0822CC;
    --foreground-inverted-bw: #FFFFFF;
    --foreground-inverted-primary: #F0F0F2;
    --foreground-inverted-secondary: #C0C1CC;
    --foreground-interactive-default: #FFFFFF;
    --foreground-interactive-active: #FFFFFF;
    --foreground-interactive-disabled: #AAADBF;
    --foreground-interactive-info: #031AA8;
    --foreground-interactive-positive-default: #DEFAE8;
    --foreground-interactive-positive-active: #DEFAE8;
    --foreground-interactive-error-default: #FFE1E1;

    /* Accent colors */
    --accent-blue: #0928F5;
    --accent-red: #FF595C;
    --accent-orange: #E59617;
    --accent-green: #6CDC95;
    --accent-yellow: #EDDB16;
    --accent-purple: #996DE3;
    --accent-pink: #E74DC3;

    /* Border colors */
    --border-main: #D2D3D9;
    --border-white: #FFFFFF;
    --border-black: #000000;
  }

  /* Dark mode */
  .dark {
    /* Background colors */
    --background-bw: #000000;
    --background-primary: #1F2024;
    --background-secondary: #2F2F30;
    --background-tertiary: #636573;
    --background-inverted: #FFFFFF;
    --background-accent: #0822CC;
    --background-interactive-primary-default: #4C63F7;
    --background-interactive-primary-hover: #213EFF;
    --background-interactive-primary-active: #0928F5;
    --background-interactive-primary-disabled: #C0C1CC;
    --background-interactive-info: #DAE8FF;
    --background-interactive-positive-default: #8CE9AE;
    --background-interactive-positive-hover: #6CDC95;
    --background-interactive-positive-active: #1E9B4C;
    --background-interactive-error-default: #FFE1E1;
    --background-interactive-error-hover: #FFC7C8;
    --background-interactive-error-active: #FFA0A2;

    /* Foreground colors */
    --foreground-bw: #FFFFFF;
    --foreground-primary: #F0F0F2;
    --foreground-secondary: #C0C1CC;
    --foreground-tertiary: #AAADBF;
    --foreground-accent: #0822CC;
    --foreground-inverted-bw: #000000;
    --foreground-inverted-primary: #2F2F30;
    --foreground-inverted-secondary: #636573;
    --foreground-interactive-default: #06115A;
    --foreground-interactive-active: #DAE8FF;
    --foreground-interactive-disabled: #636573;
    --foreground-interactive-info: #DAE8FF;
    --foreground-interactive-positive-default: #17502C;
    --foreground-interactive-positive-active: #DEFAE8;
    --foreground-interactive-error-default: #84181A;

    /* Accent colors (same as light mode) */
    --accent-blue: #0928F5;
    --accent-red: #FF595C;
    --accent-orange: #E59617;
    --accent-green: #6CDC95;
    --accent-yellow: #EDDB16;
    --accent-purple: #996DE3;
    --accent-pink: #E74DC3;

    /* Border colors */
    --border-main: #D2D3D9;
    --border-white: #FFFFFF;
    --border-black: #000000;
  }
```

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Keep your base colors as they are
        primary: {
          50: '#E8F1FF',
          100: '#DAE8FF',
          200: '#BBD4FF',
          300: '#9AB6FD',
          400: '#6B89FF',
          500: '#4C63F7',
          600: '#213EFF',
          700: '#0928F5',
          800: '#0822CC',
          900: '#031AA8',
          950: '#06115A',
        },
        neutral: {
          white: '#FFFFFF',
          50: '#F0F0F2',
          100: '#E0E1E5',
          200: '#D2D3D9',
          300: '#C0C1CC',
          400: '#AAADBF',
          500: '#8B8FA5',
          600: '#636573',
          800: '#2F2F30',
          900: '#1F2024',
          black: '#000000',
        },
        green: {
          100: '#DEFAE8',
          300: '#8CE9AE',
          400: '#6CDC95',
          600: '#1E9B4C',
          700: '#1B7A3E',
          800: '#1A6134',
          900: '#17502C',
        },
        red: {
          100: '#FFE1E1',
          200: '#FFC7C8',
          300: '#FFA0A2',
          400: '#FF595C',
          800: '#A01417',
          900: '#84181A',
          950: '#480708',
        },
        yellow: {
          200: '#F8F790',
          300: '#F3EC51',
          400: '#EDDB16',
          800: '#7F5A14',
        },
        orange: {
          200: '#F7E190',
          400: '#EFB830',
          500: '#E59617',
          800: '#8B4115',
        },
        purple: {
          200: '#E2DBF9',
          500: '#996DE3',
          800: '#6733A4',
        },
        pink: {
          200: '#FAD0F3',
          500: '#E74DC3',
          800: '#991B70',
        },
      },
      backgroundColor: theme => ({
        // Semantic backgrounds - using CSS variables with shorter names
        'bw': 'var(--background-bw)',
        'primary': 'var(--background-primary)',
        'secondary': 'var(--background-secondary)',
        'tertiary': 'var(--background-tertiary)',
        'inverted': 'var(--background-inverted)',
        'accent': 'var(--background-accent)',
        
        // Interactive backgrounds
        'interactive-primary-default': 'var(--background-interactive-primary-default)',
        'interactive-primary-hover': 'var(--background-interactive-primary-hover)',
        'interactive-primary-active': 'var(--background-interactive-primary-active)',
        'interactive-primary-disabled': 'var(--background-interactive-primary-disabled)',
        'button-secondary-default': 'var(--bg-button-secondary-default)',
        'button-secondary-hover': 'var(--bg-button-secondary-hover)',
        'button-secondary-active': 'var(--bg-button-secondary-active)',
        'button-secondary-disabled': 'var(--bg-button-secondary-disabled)',
        'interactive-tertiary-hover': 'var(--background-interactive-tertiary-hover)',
        'interactive-tertiary-active': 'var(--background-interactive-tertiary-active)',
        'interactive-info': 'var(--background-interactive-info)',
        'interactive-positive-default': 'var(--background-interactive-positive-default)',
        'interactive-positive-hover': 'var(--background-interactive-positive-hover)',
        'interactive-positive-active': 'var(--background-interactive-positive-active)',
        'interactive-error-default': 'var(--background-interactive-error-default)',
        'interactive-error-hover': 'var(--background-interactive-error-hover)',
        'interactive-error-active': 'var(--background-interactive-error-active)',
      }),
      textColor: theme => ({
        // Semantic text colors - using CSS variables with shorter names
        'bw': 'var(--foreground-bw)',
        'primary': 'var(--foreground-primary)',
        'secondary': 'var(--foreground-secondary)',
        'tertiary': 'var(--foreground-tertiary)',
        'accent': 'var(--foreground-accent)',
        'inverted-bw': 'var(--foreground-inverted-bw)',
        'inverted-primary': 'var(--foreground-inverted-primary)',
        'inverted-secondary': 'var(--foreground-inverted-secondary)',
        'interactive-default': 'var(--foreground-interactive-default)',
        'interactive-active': 'var(--foreground-interactive-active)',
        'interactive-disabled': 'var(--foreground-interactive-disabled)',
        'interactive-info': 'var(--foreground-interactive-info)',
        'interactive-positive-default': 'var(--foreground-interactive-positive-default)',
        'interactive-positive-active': 'var(--foreground-interactive-positive-active)',
        'interactive-error-default': 'var(--foreground-interactive-error-default)',
        'button-secondary-default': 'var(--text-button-secondary-default)',
        'button-secondary-text': 'var(--text-button-secondary-text)',
        'interactive-tertiary-text': 'var(--foreground-interactive-tertiary-text)',
        'interactive-positive-text': 'var(--foreground-interactive-positive-text)',
        'interactive-error-text': 'var(--foreground-interactive-error-text)',
      }),
      borderColor: theme => ({
        // Border colors - using CSS variables with shorter names
        'main': 'var(--border-main)',
        'white': 'var(--border-white)',
        'black': 'var(--border-black)',
      }),
      // Accent colors can stay in the general colors section
      accentColor: theme => ({
        'accent-blue': 'var(--accent-blue)',
        'accent-red': 'var(--accent-red)',
        'accent-orange': 'var(--accent-orange)',
        'accent-green': 'var(--accent-green)',
        'accent-yellow': 'var(--accent-yellow)',
        'accent-purple': 'var(--accent-purple)',
        'accent-pink': 'var(--accent-pink)',
      }),
      borderRadius: {
        'none': '0',
        'xxs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '20px',
        'lg': '28px',
        'xl': '36px',
      },
      fontFamily: {
        'satoshi': ['Satoshi', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Desktop Hero
        'desktop-hero-h1': ['2.75rem', { lineHeight: '120%', letterSpacing: '-0.015em' }],
        // Desktop Headings
        'desktop-section': ['1.75rem', { lineHeight: '130%', letterSpacing: '-0.01em' }],
        'desktop-subsection': ['1.5rem', { lineHeight: '140%', letterSpacing: '-0.005em' }],
        'desktop-title-body': ['1.25rem', { lineHeight: '150%', letterSpacing: '0' }],
        'desktop-title-group': ['1rem', { lineHeight: '160%', letterSpacing: '0' }],
        // Desktop Body
        'desktop-body-l': ['1.125rem', { lineHeight: '140%', letterSpacing: '-0.005em' }],
        'desktop-body-m': ['1rem', { lineHeight: '150%', letterSpacing: '0.005em' }],
        'desktop-body-s': ['0.875rem', { lineHeight: '175%', letterSpacing: '0.0175em' }],
        'desktop-body-xs': ['0.75rem', { lineHeight: '175%', letterSpacing: '0.02em' }],
        // Desktop Buttons
        'desktop-button-l': ['1.125rem', { lineHeight: '100%', letterSpacing: '-0.0025em' }],
        'desktop-button-m': ['1rem', { lineHeight: '100%', letterSpacing: '-0.0025em' }],
        'desktop-button-s': ['0.875rem', { lineHeight: '120%', letterSpacing: '0.015em' }],
        'desktop-button-xs': ['0.75rem', { lineHeight: '120%', letterSpacing: '0.015em' }],
        // Tablet
        'tablet-hero-h1': ['2.25rem', { lineHeight: '120%', letterSpacing: '-0.015em' }],
        'tablet-section': ['1.5rem', { lineHeight: '135%', letterSpacing: '-0.0075em' }],
        'tablet-subsection': ['1.25rem', { lineHeight: '140%', letterSpacing: '-0.005em' }],
        'tablet-title-body': ['1.125rem', { lineHeight: '150%', letterSpacing: '0' }],
        'tablet-title-group': ['0.875rem', { lineHeight: '160%', letterSpacing: '0' }],
        // Mobile
        'mobile-hero-h1': ['2rem', { lineHeight: '120%', letterSpacing: '-0.015em' }],
        'mobile-section': ['1.25rem', { lineHeight: '135%', letterSpacing: '-0.0075em' }],
        'mobile-subsection': ['1.125rem', { lineHeight: '130%', letterSpacing: '-0.005em' }],
        'mobile-title-body': ['1rem', { lineHeight: '150%', letterSpacing: '-0.0025em' }],
        'mobile-title-group': ['0.875rem', { lineHeight: '160%', letterSpacing: '0' }],
        // Webapp
        'webapp-screen-title': ['1.875rem', { lineHeight: '110%', letterSpacing: '-0.015em' }],
        'webapp-section-title': ['1.625rem', { lineHeight: '120%', letterSpacing: '-0.01em' }],
        'webapp-subsection': ['1.375rem', { lineHeight: '120%', letterSpacing: '-0.005em' }],
        'webapp-title-body': ['1.125rem', { lineHeight: '120%', letterSpacing: '0' }],
        'webapp-title-group': ['0.875rem', { lineHeight: '140%', letterSpacing: '0.005em' }],
        // Special
        'desktop-tag': ['1rem', { lineHeight: '150%', letterSpacing: '0.03em' }],
        'desktop-chip': ['0.625rem', { lineHeight: '100%', letterSpacing: '0.02em' }],
      },
    },
  }
}
```

---

## Accessibility Guidelines

1. **Focus States**: All buttons must have visible focus indicators
2. **Keyboard Navigation**: Ensure Tab key navigation works properly
3. **ARIA Labels**: Use `aria-label` for icon-only buttons
4. **Disabled State**: Use `aria-disabled` alongside `disabled` attribute
5. **Loading State**: Include `aria-busy="true"` during loading
6. **Contrast Ratios**: Ensure WCAG AA compliance (4.5:1 for normal text)

```tsx
<Button
  aria-label="Gedenkseite erstellen"
  aria-busy={loading}
  aria-disabled={disabled}
>
  {children}
</Button>
```

---

## Usage Examples

### Primary CTA
```tsx
<Button variant="primary" size="lg" onClick={handleStart}>
  Jetzt starten
</Button>
```

### Form Submit
```tsx
<Button 
  variant="primary" 
  size="md" 
  fullWidth // Full width on mobile only
  loading={isSubmitting}
  disabled={!isValid}
>
  Fertig
</Button>
```

### Cancel Action
```tsx
<Button variant="secondary" size="md" onClick={handleCancel}>
  Abbrechen
</Button>
```

### Destructive Action
```tsx
<Button 
  variant="negative" 
  size="sm" 
  onClick={handleDelete}
  leftIcon={<TrashIcon />}
>
  Eintrag löschen
</Button>
```

### Subtle Link
```tsx
<Button variant="tertiary" size="sm">
  Weitere Felder hinzufügen
</Button>
```

---

## Best Practices

1. **Consistent Sizing**: Use the same button size within a form or section
2. **Clear Hierarchy**: Only one primary button per screen/section
3. **Meaningful Labels**: Use descriptive, action-oriented text
4. **Loading States**: Always show loading state for async operations
5. **Touch Targets**: Minimum 44x44px touch target on mobile (satisfied by sm size and up)
6. **Semantic Tokens**: Always use semantic color tokens, not raw color values
7. **Theme Agnostic**: Let CSS variables handle theme switching

---

The new approach automatically handles theme switching through CSS variables, eliminating the need for dark mode classes in your components.
