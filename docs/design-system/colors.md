# Gedenkseiten.ai - Tailwind Color Configuration

## Currently Used Colors

Based on the design system PDFs, these are the colors currently in use:

### Brand Primary Colors
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
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
        // Additional accent colors mentioned in Alias tokens
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
    },
  },
}
```

## Semantic Color Tokens (Alias Tokens)

### Light Mode
```javascript
// Light mode color mappings
const lightModeColors = {
  // Backgrounds
  'background-bw': 'neutral-white',
  'background-primary': 'neutral-50',
  'background-secondary': 'neutral-100',
  'background-tertiary': 'neutral-200',
  'background-inverted': 'neutral-black',
  'background-accent': 'primary-300',
  'background-interactive-primary-default': 'primary-700',
  'background-interactive-primary-hover': 'primary-800',
  'background-interactive-primary-active': 'primary-900',
  'background-interactive-primary-disabled': 'neutral-100',
  'background-interactive-info': 'primary-100',
  'background-interactive-positive-default': 'green-600',
  'background-interactive-positive-hover': 'green-700',
  'background-interactive-positive-active': 'green-800',
  'background-interactive-error-default': 'red-800',
  'background-interactive-error-hover': 'red-900',
  'background-interactive-error-active': 'red-950',
  
  // Foregrounds
  'foreground-bw': 'neutral-black',
  'foreground-primary': 'neutral-800',
  'foreground-secondary': 'neutral-600',
  'foreground-tertiary': 'neutral-500',
  'foreground-accent': 'primary-800',
  'foreground-inverted-bw': 'neutral-white',
  'foreground-inverted-primary': 'neutral-50',
  'foreground-inverted-secondary': 'neutral-300',
  'foreground-interactive-default': 'neutral-white',
  'foreground-interactive-active': 'neutral-white',
  'foreground-interactive-disabled': 'neutral-400',
  'foreground-interactive-info': 'primary-900',
  'foreground-interactive-positive-default': 'green-100',
  'foreground-interactive-positive-active': 'green-100',
  'foreground-interactive-error-default': 'red-100',
  
  // Accents
  'accent-blue': 'primary-700',
  'accent-red': 'red-400',
  'accent-orange': 'orange-500',
  'accent-green': 'green-400',
  'accent-yellow': 'yellow-400',
  'accent-purple': 'purple-500',
  'accent-pink': 'pink-500',
  
  // Borders
  'border-main': 'neutral-200',
  'border-white': 'neutral-white',
  'border-black': 'neutral-black',
};
```

### Dark Mode
```javascript
// Dark mode color mappings
const darkModeColors = {
  // Backgrounds
  'background-bw': 'neutral-black',
  'background-primary': 'neutral-900',
  'background-secondary': 'neutral-800',
  'background-tertiary': 'neutral-600',
  'background-inverted': 'neutral-white',
  'background-accent': 'primary-800',
  'background-interactive-primary-default': 'primary-300',
  'background-interactive-primary-hover': 'primary-400',
  'background-interactive-primary-active': 'primary-500',
  'background-interactive-primary-disabled': 'neutral-300',
  'background-interactive-info': 'primary-100',
  'background-interactive-positive-default': 'green-300',
  'background-interactive-positive-hover': 'green-400',
  'background-interactive-positive-active': 'green-600',
  'background-interactive-error-default': 'red-100',
  'background-interactive-error-hover': 'red-200',
  'background-interactive-error-active': 'red-300',
  
  // Foregrounds
  'foreground-bw': 'neutral-white',
  'foreground-primary': 'neutral-50',
  'foreground-secondary': 'neutral-300',
  'foreground-tertiary': 'neutral-400',
  'foreground-accent': 'primary-800',
  'foreground-inverted-bw': 'neutral-black',
  'foreground-inverted-primary': 'neutral-800',
  'foreground-inverted-secondary': 'neutral-600',
  'foreground-interactive-default': 'primary-950',
  'foreground-interactive-active': 'primary-50',
  'foreground-interactive-disabled': 'neutral-600',
  'foreground-interactive-info': 'primary-100',
  'foreground-interactive-positive-default': 'green-900',
  'foreground-interactive-positive-active': 'green-100',
  'foreground-interactive-error-default': 'red-900',
  
  // Accents (same as light mode)
  'accent-blue': 'primary-700',
  'accent-red': 'red-400',
  'accent-orange': 'orange-500',
  'accent-green': 'green-400',
  'accent-yellow': 'yellow-400',
  'accent-purple': 'purple-500',
  'accent-pink': 'pink-500',
  
  // Borders
  'border-main': 'neutral-200',
  'border-white': 'neutral-white',
  'border-black': 'neutral-black',
};
```

## Usage in Components

```jsx
// Example usage in React/Next.js components

// Background colors
<div className="bg-neutral-50"> // Light mode primary background
<div className="dark:bg-neutral-900"> // Dark mode primary background

// Text colors
<p className="text-neutral-800"> // Light mode primary text
<p className="dark:text-neutral-50"> // Dark mode primary text

// Interactive elements
<button className="bg-primary-700 hover:bg-primary-800 active:bg-primary-900 disabled:bg-neutral-100">
  // Light mode primary button
</button>

<button className="dark:bg-primary-300 dark:hover:bg-primary-400 dark:active:bg-primary-500 dark:disabled:bg-neutral-300">
  // Dark mode primary button
</button>

// Borders
<div className="border border-neutral-200">
```

## Border Radius Tokens

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'xxs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md': '20px',
        'lg': '28px',
        'xl': '36px',
        'full': '100%',
      },
    },
  },
}
```

## Dark Mode Configuration

```javascript
// app/layout.tsx or _app.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Tailwind Dark Mode Setup

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

### Theme Toggle Component

```jsx
// components/ThemeToggle.jsx
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-neutral-800 dark:text-neutral-50" />
      ) : (
        <Moon className="h-5 w-5 text-neutral-800 dark:text-neutral-50" />
      )}
    </button>
  )
}
```

## Complete Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Add all color definitions from above
        primary: { /* ... */ },
        neutral: { /* ... */ },
        green: { /* ... */ },
        red: { /* ... */ },
        yellow: { /* ... */ },
        orange: { /* ... */ },
        purple: { /* ... */ },
        pink: { /* ... */ },
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
      },
    },
  },
  plugins: [],
}
```

## Notes for Development

1. **Dark Mode**: The system uses class-based dark mode. Add `dark` class to the root element to enable dark mode.

2. **Semantic Tokens**: Consider creating custom utility classes for semantic tokens to maintain consistency:
   ```css
   @layer utilities {
     .bg-primary-surface {
       @apply bg-neutral-50 dark:bg-neutral-900;
     }
     .text-primary {
       @apply text-neutral-800 dark:text-neutral-50;
     }
   }
   ```

3. **Interactive States**: Always include hover, active, and disabled states for interactive elements.

4. **Accessibility**: The color system follows AAA contrast ratios as indicated in the design files.