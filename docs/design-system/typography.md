# Gedenkseiten.ai Typography Documentation

## Overview
This document defines the typography system for Gedenkseiten.ai, including font families, sizes, weights, and their specific use cases across different platforms and devices.

**Platform Distinction:**
- **Desktop/Tablet/Mobile**: Used for the public-facing website (frontend)
- **Webapp**: Used for the dashboard and authenticated user areas (backend)

---

## Font Families

### Primary Fonts
- **Satoshi**: Used for hero headings and special UI elements (tags)
- **Inter**: Used for all other text elements (body text, subheadings, buttons, etc.)

---

## Typography Scale

### 1. Title/Heading Styles

#### Desktop Headings
| Level | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| H1 | Satoshi | Medium | 44px (2.75rem) | 120% | -1.5% | Desktop-Hero(H1) | Main page titles, hero sections |
| H2 | Inter | Medium | 28px (1.75rem) | 130% | -1% | Desktop-Section | Section headings |
| H3 | Inter | Medium | 24px (1.5rem) | 140% | -0.5% | Desktop-Subsection | Subsection headings |
| H4 | Inter | Medium | 20px (1.25rem) | 150% | 0% | Desktop-Title-Body | Body section titles |
| H5 | Inter | Semi Bold | 16px (1rem) | 160% | 0% | Desktop-Title-Group | Group titles, small headings |

#### Tablet Headings
| Level | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| H1 | Satoshi | Medium | 36px (2.25rem) | 120% | -1.5% | Tablet-Hero(H1) | Main page titles, hero sections |
| H2 | Inter | Medium | 24px (1.5rem) | 135% | -0.75% | Tablet-Section | Section headings |
| H3 | Inter | Medium | 20px (1.25rem) | 140% | -0.5% | Tablet-Subsection | Subsection headings |
| H4 | Inter | Medium | 18px (1.125rem) | 150% | 0% | Tablet-Title-Body | Body section titles |
| H5 | Inter | Semi Bold | 14px (0.875rem) | 160% | 0% | Tablet-Title-Group | Group titles, small headings |

#### Mobile Headings
| Level | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| H1 | Satoshi | Medium | 32px (2rem) | 120% | -1.5% | Mobil-Hero(H1) | Main page titles, hero sections |
| H2 | Inter | Medium | 20px (1.25rem) | 135% | -0.75% | Mobil-Section | Section headings |
| H3 | Inter | Medium | 18px (1.125rem) | 130% | -0.5% | Mobil-Subsection | Subsection headings |
| H4 | Inter | Semi Bold | 16px (1rem) | 150% | -0.25% | Mobil-Title-Body | Body section titles |
| H5 | Inter | Semi Bold | 14px (0.875rem) | 160% | 0% | Mobil-Title-Group | Group titles, small headings |

#### Webapp Headings (Dashboard/Backend)
| Level | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| H1 | Satoshi | Bold | 30px (1.875rem) | 110% | -1.5% | Webapp-Screen-Title | Dashboard screen titles |
| H2 | Inter | Semi Bold | 26px (1.625rem) | 120% | -1% | Webapp-Section-Title | Dashboard section titles |
| H3 | Inter | Semi Bold | 22px (1.375rem) | 120% | -0.5% | Webapp-Subsection | Dashboard subsections |
| H4 | Inter | Semi Bold | 18px (1.125rem) | 120% | 0% | Webapp-Title-Body | Dashboard body titles |
| H5 | Inter | Semi Bold | 14px (0.875rem) | 140% | 0.5% | Webapp-Title-Group | Dashboard group titles |

---

### 2. Body Text Styles

| Style | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| Body L | Inter | Medium | 18px (1.125rem) | 140% | -0.5% | Desktop-Body-L | Large body text, intro paragraphs |
| Body M | Inter | Medium | 16px (1rem) | 150% | 0.5% | Desktop-Body-M-M | Standard body text |
| Body M (Semibold) | Inter | Semi Bold | 16px (1rem) | 150% | 0.5% | Desktop-Body-M-SM | Emphasized body text |
| Body S | Inter | Medium | 14px (0.875rem) | 175% | 1.75% | Desktop-Body-S-M | Small body text, captions |
| Body S (Semibold) | Inter | Semi Bold | 14px (0.875rem) | 175% | 1.75% | Desktop-Body-S-SM | Small emphasized text |
| Body XS | Inter | Medium | 12px (0.75rem) | 175% | 2% | Desktop-Body-XS-M | Extra small text, labels |
| Body XS (Semibold) | Inter | Semi Bold | 12px (0.75rem) | 175% | 2% | Desktop-Body-XS-SM | Extra small emphasized text |

---

### 3. Button Text Styles

| Style | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| Button L | Inter | Medium | 18px (1.125rem) | 100% | -0.25% | Desktop-Button-L | Large buttons (CTAs) |
| Button M | Inter | Medium | 16px (1rem) | 100% | -0.25% | Desktop-Button-M | Standard buttons |
| Button S | Inter | Medium | 14px (0.875rem) | 120% | 1.5% | Desktop-Button-S | Small buttons |
| Button XS | Inter | Medium | 12px (0.75rem) | 120% | 1.5% | Desktop-Button-XS | Extra small buttons, tertiary actions |

---

### 4. Other Styles

| Style | Font | Weight | Size | Line Height | Letter Spacing | Token | Use Case |
|-------|------|--------|------|-------------|----------------|-------|----------|
| Tag | Satoshi | Medium | 16px (1rem) | 150% | 3% | Desktop-Tag | Tags, badges, labels |
| Chip | Inter | Semi Bold | 10px (0.625rem) | 100% | 2% | Desktop-Chip | Chips, small indicators |

---

## Implementation Guidelines

### CSS Variables (Example)
```css
:root {
  /* Font Families */
  --font-satoshi: 'Satoshi', sans-serif;
  --font-inter: 'Inter', sans-serif;
  
  /* Desktop Hero */
  --desktop-hero-h1: {
    font-family: var(--font-satoshi);
    font-weight: 500;
    font-size: 2.75rem;
    line-height: 1.2;
    letter-spacing: -0.015em;
  }
  
  /* Desktop Body */
  --desktop-body-m: {
    font-family: var(--font-inter);
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.5;
    letter-spacing: 0.005em;
  }
}
```

### Responsive Typography
- Use appropriate heading scales for each breakpoint
- Maintain visual hierarchy across all device sizes
- Ensure readable line lengths (45-75 characters for body text)
- Test letter spacing on actual devices for optimal readability

### Accessibility Guidelines
- Maintain minimum contrast ratios (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- Use semantic HTML elements (h1-h6) for headings
- Ensure font sizes are readable (minimum 14px for body text)
- Support browser font scaling

### Usage Notes
1. **Hero Headings**: Use Satoshi for maximum impact on landing pages
2. **Body Text**: Stick to Inter for consistency and readability
3. **Weight Variations**: Use Semi Bold sparingly for emphasis
4. **Letter Spacing**: Negative values for large headings improve visual balance
5. **Line Height**: Higher values for smaller text improve readability

---

## Token Naming Convention

Format: `[Platform]-[Category]-[Variant]`

Examples:
- `Desktop-Hero(H1)` - Desktop hero heading
- `Webapp-Section-Title` - Webapp section title
- `Desktop-Body-M-SM` - Desktop body medium semibold
- `Desktop-Button-L` - Desktop large button

This consistent naming helps developers quickly identify and apply the correct typography styles across the application.