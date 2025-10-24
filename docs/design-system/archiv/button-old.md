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

**Tailwind Classes**:
```css
/* Light Mode */
.btn-primary {
  @apply bg-primary-700 text-white font-medium rounded-md
         hover:bg-primary-800 active:bg-primary-900
         disabled:bg-neutral-100 disabled:text-neutral-400
         transition-colors duration-200;
}

/* Dark Mode */
.dark .btn-primary {
  @apply bg-primary-300 text-primary-950
         hover:bg-primary-400 active:bg-primary-500
         disabled:bg-neutral-700 disabled:text-neutral-500;
}
```

### 2. Secondary Button
**Purpose**: Secondary actions and alternative options  
**Use Cases**: e.g. "Einloggen" next to "Signup"

```typescript
interface SecondaryButtonProps {
  variant: 'secondary';
  size: 'xs' | 'sm' | 'md' | 'lg';
  state?: 'default' | 'hover' | 'active' | 'disabled';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Tailwind Classes**:
```css
/* Light Mode */
.btn-secondary {
  @apply bg-background-interactive-secondary-default text-foreground-interactive-default
         hover:bg-background-interactive-secondary-hover active:bg-background-interactive-secondary-active
         disabled:bg-neutral-100 disabled:text-neutral-400
         transition-colors duration-200;
}

/* Dark Mode */
.dark .btn-secondary {
  @apply bg-neutral-800 border-neutral-600 text-neutral-50
         hover:bg-neutral-700 active:bg-neutral-600
         disabled:bg-neutral-700 disabled:text-neutral-500;
}
```

### 3. Tertiary Button
**Purpose**: Low-emphasis actions, often text-only  
**Use Cases**: "Mehr anzeigen", Links, "Abbrechen", "Überspringen", "Zurück"

```typescript
interface TertiaryButtonProps {
  variant: 'tertiary';
  size: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Tailwind Classes**:
```css
.btn-tertiary {
  @apply text-primary-700 hover:text-primary-800 
         active:text-primary-900 underline-offset-4
         hover:underline transition-colors duration-200;
}

.dark .btn-tertiary {
  @apply text-primary-300 hover:text-primary-400
         active:text-primary-500;
}
```

### 4. Positive Button
**Purpose**: Confirmation and success actions  
**Use Cases**: "Freigeben", "Bestätigen", "Speichern"

```typescript
interface PositiveButtonProps {
  variant: 'positive';
  size: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Tailwind Classes**:
```css
/* Light Mode */
.btn-positive {
  @apply bg-green-600 text-green-100
         hover:bg-green-700 active:bg-green-800
         disabled:bg-neutral-100 disabled:text-neutral-400;
}

/* Dark Mode */
.dark .btn-positive {
  @apply bg-green-300 text-green-900
         hover:bg-green-400 active:bg-green-600;
}
```

### 5. Negative/Destructive Button
**Purpose**: Destructive actions requiring caution  
**Use Cases**: "Löschen", "Ablehnen", "Entfernen"

```typescript
interface NegativeButtonProps {
  variant: 'negative' | 'destructive';
  size: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Tailwind Classes**:
```css
/* Light Mode */
.btn-negative {
  @apply bg-red-800 text-red-100
         hover:bg-red-900 active:bg-red-950
         disabled:bg-neutral-100 disabled:text-neutral-400;
}

/* Dark Mode */
.dark .btn-negative {
  @apply bg-red-100 text-red-900
         hover:bg-red-200 active:bg-red-300;
}
```

---

## Button Sizes

### Size Specifications

| Size | Typography Token | Font Size | Padding (top, right, bottom, left) | Border Radius Token | Border Radius | Use Case |
|------|-----------------|-----------|-----------------------------------|-------------------|---------------|-----------|
| `lg` | Desktop-Button-L | 18px | 16px, 24px, 16px, 24px | border-radius-sm | 16px | Hero CTAs |
| `md` | Desktop-Button-M | 16px | 12px, 20px, 12px, 20px | border-radius-xs | 12px | Standard actions |
| `sm` | Desktop-Button-S | 14px | 10px, 12px, 10px, 12px | border-radius-xxs | 8px | Secondary actions |
| `xs` | Desktop-Button-XS | 12px | 4px | border-radius-xxs | 8px | Inline actions |

### Size Implementation
```tsx
// Button size classes - using typography tokens from typography.md
const sizeClasses = {
  lg: 'text-lg py-4 px-6 rounded-sm', // Desktop-Button-L: 18px, padding: 16/24, radius: 16px
  md: 'text-base py-3 px-5 rounded-xs', // Desktop-Button-M: 16px, padding: 12/20, radius: 12px
  sm: 'text-sm py-2.5 px-3 rounded-xxs', // Desktop-Button-S: 14px, padding: 10/12, radius: 8px
  xs: 'text-xs p-1 rounded-xxs' // Desktop-Button-XS: 12px, padding: 4, radius: 8px
};
```

---

## Button States

### 1. Default State
Normal resting state of the button.

### 2. Hover State
Activated on mouse hover.
```css
hover:bg-primary-800 /* Example for primary button */
```

### 3. Active/Pressed State
When button is being clicked.
```css
active:bg-primary-900 /* Color change for feedback */
```

### 4. Disabled State
Non-interactive state.
```css
disabled:bg-neutral-100 disabled:text-neutral-400 
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

  // Variant styles
  const variantStyles = {
    primary: `
      bg-primary-700 text-white hover:bg-primary-800 
      active:bg-primary-900 focus:ring-primary-500
      disabled:bg-neutral-100 disabled:text-neutral-400
      dark:bg-primary-300 dark:text-primary-950
      dark:hover:bg-primary-400 dark:active:bg-primary-500
    `,
    secondary: `
      bg-white border border-neutral-200 text-neutral-800
      hover:bg-neutral-50 active:bg-neutral-100
      focus:ring-neutral-500 disabled:bg-neutral-100
      dark:bg-neutral-800 dark:border-neutral-600 
      dark:text-neutral-50 dark:hover:bg-neutral-700
    `,
    tertiary: `
      text-primary-700 hover:text-primary-800 bg-transparent
      hover:bg-primary-50 active:bg-primary-100
      focus:ring-primary-500 dark:text-primary-300
      dark:hover:text-primary-400 dark:hover:bg-primary-900/10
    `,
    positive: `
      bg-green-600 text-green-100 hover:bg-green-700
      active:bg-green-800 focus:ring-green-500
      disabled:bg-neutral-100 disabled:text-neutral-400
      dark:bg-green-300 dark:text-green-900
      dark:hover:bg-green-400 dark:active:bg-green-600
    `,
    negative: `
      bg-red-800 text-red-100 hover:bg-red-900
      active:bg-red-950 focus:ring-red-500
      disabled:bg-neutral-100 disabled:text-neutral-400
      dark:bg-red-100 dark:text-red-900
      dark:hover:bg-red-200 dark:active:bg-red-300
    `
  };

  // Size styles
  const sizeStyles = {
    xs: 'text-xs p-1 rounded-xxs', // Desktop-Button-XS, border-radius: 8px
    sm: 'text-sm py-2.5 px-3 rounded-xxs', // Desktop-Button-S, border-radius: 8px
    md: 'text-base py-3 px-5 rounded-xs', // Desktop-Button-M, border-radius: 12px
    lg: 'text-lg py-4 px-6 rounded-sm' // Desktop-Button-L, border-radius: 16px
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
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
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
const socialButtonStyles = {
  google: 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50',
  apple: 'bg-black text-white hover:bg-neutral-900',
  microsoft: 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
};

// Usage
<Button className={socialButtonStyles.google} size="lg" fullWidth>
  <GoogleIcon className="mr-2" />
  Mit Google fortfahren
</Button>
```

### 2. Floating Action Button (FAB)
```tsx
<button className="fixed bottom-6 right-6 p-4 bg-primary-700 
                   text-white rounded-full shadow-lg hover:bg-primary-800 
                   focus:outline-none focus:ring-2 focus:ring-primary-500">
  <PlusIcon className="h-6 w-6" />
</button>
```

### 3. Button Groups
```tsx
<div className="inline-flex rounded-md shadow-sm" role="group">
  <Button variant="secondary" className="rounded-r-none">
    Vorheriges
  </Button>
  <Button variant="secondary" className="rounded-l-none border-l-0">
    Nächstes
  </Button>
</div>
```

---

## Accessibility Guidelines

1. **Focus States**: All buttons must have visible focus indicators
2. **Keyboard Navigation**: Ensure Tab key navigation works properly
3. **ARIA Labels**: Use `aria-label` for icon-only buttons
4. **Disabled State**: Use `aria-disabled` alongside `disabled` attribute
5. **Loading State**: Include `aria-busy="true"` during loading

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
  fullWidth // Will be full width on mobile, auto width on desktop
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

### Text Link Button
```tsx
<Button variant="tertiary" size="sm">
  Weitere Felder hinzufügen
</Button>
```

---

## Theme Integration

Buttons automatically adapt to the current theme (light/dark mode) using Tailwind's dark mode classes. Ensure your `tailwind.config.js` includes:

```javascript
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F1FF',
          100: '#DAE8FF',
          300: '#9AB6FD',
          700: '#0928F5',
          800: '#0822CC',
          900: '#031AA8',
          950: '#06115A'
        },
        // ... other color definitions
      },
      borderRadius: {
        'none': '0',
        'xxs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '20px',
        'lg': '28px',
        'xl': '36px',
        'full': '100%',
      }
    }
  }
}
```

---

## Best Practices

1. **Consistent Sizing**: Use the same button size within a form or section
2. **Clear Hierarchy**: Only one primary button per screen/section
3. **Meaningful Labels**: Use descriptive, action-oriented text
4. **Loading States**: Always show loading state for async operations
5. **Touch Targets**: Minimum 44x44px touch target on mobile
6. **Color Contrast**: Ensure WCAG AA compliance (4.5:1 for normal text)

---

## Migration from Legacy Buttons

If migrating from older button implementations:

```tsx
// Old
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>

// New
<Button variant="primary" size="md">
  Click me
</Button>
```
