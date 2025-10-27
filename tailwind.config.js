/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '0',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1320px',
        '2xl': '1320px',
      },
    },
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
          50: '#FFFCE8',
          100: '#FEF9C3',
          200: '#F8F790',
          300: '#F3EC51',
          400: '#EDDB16',
          600: '#CA9A04',
          700: '#A07803',
          800: '#7F5A14',
          900: '#713F12',
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
        'bw-opacity-80': 'var(--bg-bw-opacity-80)',
        'bw-opacity-60': 'var(--bg-bw-opacity-60)',
        'bw-opacity-40': 'var(--bg-bw-opacity-40)',
        'primary': 'var(--background-primary)',
        'secondary': 'var(--background-secondary)',
        'tertiary': 'var(--background-tertiary)',
        'inverted': 'var(--background-inverted)',
        'accent': 'var(--background-accent)',
        
        
        // Interactive backgrounds
        'interactive-primary-default': 'var(--background-interactive-primary-default)',
        'interactive-primary-hover': 'var(--background-interactive-primary-hover)',
        'interactive-primary-active': 'var(--background-interactive-primary-active)',
        'interactive-disabled': 'var(--background-interactive-disabled)',
        'interactive-secondary-default': 'var(--background-interactive-secondary-default)',
        'interactive-secondary-hover': 'var(--background-interactive-secondary-hover)',
        'interactive-secondary-active': 'var(--background-interactive-secondary-active)',
        'interactive-tertiary-hover': 'var(--background-interactive-tertiary-hover)',
        'interactive-tertiary-active': 'var(--background-interactive-tertiary-active)',
        'interactive-info': 'var(--background-interactive-info)',
        'interactive-positive-default': 'var(--background-interactive-positive-default)',
        'interactive-positive-hover': 'var(--background-interactive-positive-hover)',
        'interactive-positive-active': 'var(--background-interactive-positive-active)',
        'error-message': 'var(--bg-error-message)',
        'interactive-error-default': 'var(--background-interactive-error-default)',
        'interactive-error-hover': 'var(--background-interactive-error-hover)',
        'interactive-error-active': 'var(--background-interactive-error-active)',
      }),
      backgroundImage: {
        // Your 4 core gradients
        'gradient-night-is-coming': 'linear-gradient(156deg, #0928F5 0%, #E59617 93.76%)',
        'gradient-warm-sunset': 'linear-gradient(115deg, #996DE3 10.45%, #E74DC3 46.56%, #EDDB16 83.37%)',
        'gradient-garden-floristic': 'linear-gradient(201deg, #FF595C 0%, #6CDC95 91.41%)',
        'gradient-hot-hell': 'linear-gradient(180deg, #FF595C 0%, #E59617 100%)',
        
        // Additional brand gradient from your landing page
        'gradient-brand': 'linear-gradient(135deg, #FF595C 0%, #E74DC3 50%, #996DE3 75%, #6CDC95 100%)',
      },

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
        'interactive-link-default': 'var(--text-interactive-link-default)',
        'interactive-link-hover': 'var(--text-interactive-link-hover)',
        'interactive-link-active': 'var(--text-interactive-link-active)',
        'interactive-positive-default': 'var(--foreground-interactive-positive-default)',
        'interactive-positive-active': 'var(--foreground-interactive-positive-active)',
        'interactive-error-default': 'var(--foreground-interactive-error-default)',
        'interactive-secondary-default': 'var(--foreground-interactive-secondary-default)',
        'interactive-tertiary-text': 'var(--foreground-interactive-tertiary-text)',
        'interactive-positive-text': 'var(--foreground-interactive-positive-text)',
        'interactive-error-text': 'var(--foreground-interactive-error-text)',
        'error-message': 'var(--text-error-message)',
        'accent-blue': 'var(--accent-blue)',
        'accent-red': 'var(--accent-red)',
        'accent-orange': 'var(--accent-orange)',
        'accent-green': 'var(--accent-green)',
        'accent-yellow': 'var(--accent-yellow)',
        'accent-purple': 'var(--accent-purple)',
        'accent-pink': 'var(--accent-pink)',
      }),
      borderColor: theme => ({
        // Border colors - using CSS variables with shorter names
        'main': 'var(--border-main)',
        'white': 'var(--border-white)',
        'black': 'var(--border-black)',
        'hover': 'var(--border-hover)',
        'active': 'var(--border-active)',
      }),
      placeholderColor: theme => ({
        // Placeholder colors - using CSS variables with shorter names
        'primary': 'var(--foreground-primary)',
        'secondary': 'var(--foreground-secondary)',
        'tertiary': 'var(--foreground-tertiary)',
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
        'text-desktop-body-l': ['1.125rem', { lineHeight: '140%', letterSpacing: '-0.005em' }],
        'text-desktop-body-m': ['1rem', { lineHeight: '150%', letterSpacing: '0.005em' }],
        'text-desktop-body-s': ['0.875rem', { lineHeight: '175%', letterSpacing: '0.0175em' }],
        'text-desktop-body-xs': ['0.75rem', { lineHeight: '175%', letterSpacing: '0.02em' }],
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
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fit, minmax(320px, 1fr))',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // Note: The custom plugin is no longer needed since we're using 
    // the extend configuration above
  ],
}