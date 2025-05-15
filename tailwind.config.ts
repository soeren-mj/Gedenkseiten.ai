export default {
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
        'background-primary': 'var(--background-primary, #1F2024)',
        'background-bw': 'var(--background-bw, #000000)',
        'primary': 'var(--primary)',
        'foreground-bw': 'var(--foreground-bw, #ffffff)',
        'foreground-secondary': 'var(--foreground-secondary, #c0c1cc)',
        'foreground-interactiv-accents-orange': 'var(--foreground-interactiv-accents-orange, #E5A417)',
        'foreground-interactiv-primary-disabled': 'var(--foreground-interactiv-primary-disabled, #858585)',
        'background-interactiv-primary-default': 'var(--background-interactiv-primary-default, #ffffff)',
        // weitere Farben nach Bedarf
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
    },
  },
  darkMode: 'class'
} 