/**
 * Helper functions for design-review validation
 */

const fs = require('fs');
const path = require('path');

/**
 * Calculate Levenshtein distance between two strings
 * Used for suggesting similar class names
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Find similar class names using Levenshtein distance
 * @param {string} invalidClass - The invalid class name
 * @param {string[]} validClasses - Array of valid class names
 * @param {number} maxDistance - Maximum distance to consider (default: 3)
 * @returns {string[]} Array of similar class names
 */
function findSimilarClasses(invalidClass, validClasses, maxDistance = 3) {
  const suggestions = [];

  for (const validClass of validClasses) {
    const distance = levenshteinDistance(invalidClass, validClass);
    if (distance <= maxDistance) {
      suggestions.push({ class: validClass, distance });
    }
  }

  // Sort by distance (closest first)
  suggestions.sort((a, b) => a.distance - b.distance);

  return suggestions.slice(0, 5).map(s => s.class);
}

/**
 * Extract className strings from React component files
 * Handles: className="...", className={cn(...)}
 * @param {string} content - File content
 * @returns {object[]} Array of {class: string, line: number}
 */
function extractClassNames(content) {
  const classNames = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Match className="..." or className='...'
    const staticMatches = line.matchAll(/className=["']([^"']+)["']/g);
    for (const match of staticMatches) {
      const classes = match[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls.trim()) {
          classNames.push({ class: cls.trim(), line: index + 1 });
        }
      });
    }

    // Match strings inside className={cn(...)} or className={...}
    // This is a simplified approach - matches quoted strings in className attributes
    const dynamicMatches = line.matchAll(/className=\{[^}]*["']([^"']+)["'][^}]*\}/g);
    for (const match of dynamicMatches) {
      const classes = match[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls.trim()) {
          classNames.push({ class: cls.trim(), line: index + 1 });
        }
      });
    }
  });

  return classNames;
}

/**
 * Parse tailwind.config.js to extract available semantic classes
 * @param {string} configPath - Path to tailwind.config.js
 * @returns {object} Object with categorized available classes
 */
function parseTailwindConfig(configPath) {
  const configContent = fs.readFileSync(configPath, 'utf-8');

  const classes = {
    backgroundColor: [],
    textColor: [],
    borderColor: [],
    placeholderColor: [],
    borderRadius: [],
    fontSize: []
  };

  // Extract backgroundColor
  const bgColorMatch = configContent.match(/backgroundColor:\s*theme\s*=>\s*\({([^}]+)\}/s);
  if (bgColorMatch) {
    const bgColors = bgColorMatch[1].matchAll(/['"]([^'"]+)['"]\s*:/g);
    for (const match of bgColors) {
      classes.backgroundColor.push(`bg-${match[1]}`);
    }
  }

  // Extract textColor
  const textColorMatch = configContent.match(/textColor:\s*theme\s*=>\s*\({([^}]+)\}/s);
  if (textColorMatch) {
    const textColors = textColorMatch[1].matchAll(/['"]([^'"]+)['"]\s*:/g);
    for (const match of textColors) {
      classes.textColor.push(`text-${match[1]}`);
    }
  }

  // Extract borderColor
  const borderColorMatch = configContent.match(/borderColor:\s*theme\s*=>\s*\({([^}]+)\}/s);
  if (borderColorMatch) {
    const borderColors = borderColorMatch[1].matchAll(/['"]([^'"]+)['"]\s*:/g);
    for (const match of borderColors) {
      classes.borderColor.push(`border-${match[1]}`);
    }
  }

  // Extract borderRadius
  const borderRadiusMatch = configContent.match(/borderRadius:\s*{([^}]+)}/s);
  if (borderRadiusMatch) {
    const radii = borderRadiusMatch[1].matchAll(/['"]([^'"]+)['"]\s*:/g);
    for (const match of radii) {
      classes.borderRadius.push(`rounded-${match[1]}`);
    }
  }

  // Extract placeholderColor
  const placeholderColorMatch = configContent.match(/placeholderColor:\s*theme\s*=>\s*\({([^}]+)\}/s);
  if (placeholderColorMatch) {
    const placeholderColors = placeholderColorMatch[1].matchAll(/['"]([^'"]+)['"]\s*:/g);
    for (const match of placeholderColors) {
      classes.placeholderColor.push(`placeholder-${match[1]}`);
    }
  }

  return classes;
}

/**
 * Parse globals.css to extract available CSS variables
 * @param {string} cssPath - Path to globals.css
 * @returns {object} Object with light and dark mode variables
 */
function parseGlobalsCss(cssPath) {
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  const variables = {
    light: [],
    dark: []
  };

  // Extract :root (light mode) variables
  const rootMatch = cssContent.match(/:root\s*{([^}]+)}/s);
  if (rootMatch) {
    const vars = rootMatch[1].matchAll(/--([a-z-]+)\s*:/g);
    for (const match of vars) {
      variables.light.push(`--${match[1]}`);
    }
  }

  // Extract .dark (dark mode) variables
  const darkMatch = cssContent.match(/\.dark\s*{([^}]+)}/s);
  if (darkMatch) {
    const vars = darkMatch[1].matchAll(/--([a-z-]+)\s*:/g);
    for (const match of vars) {
      variables.dark.push(`--${match[1]}`);
    }
  }

  return variables;
}

/**
 * Check if a class uses incorrect prefix patterns
 * e.g., bg-background-*, text-foreground-*, border-border-*
 */
function hasIncorrectPrefix(className) {
  const incorrectPatterns = [
    /^bg-background-/,
    /^text-foreground-/,
    /^border-border-/,
    /^ring-border-/,
    /^ring-offset-background-/,
    /^placeholder-foreground-/
  ];

  return incorrectPatterns.some(pattern => pattern.test(className));
}

/**
 * Suggest correct class name for incorrect prefix
 */
function suggestCorrectPrefix(className) {
  const corrections = {
    'bg-background-': 'bg-',
    'text-foreground-': 'text-',
    'border-border-': 'border-',
    'ring-border-': 'ring-',
    'ring-offset-background-': 'ring-offset-',
    'placeholder-foreground-': 'placeholder-'
  };

  for (const [incorrect, correct] of Object.entries(corrections)) {
    if (className.startsWith(incorrect)) {
      return className.replace(incorrect, correct);
    }
  }

  return null;
}

/**
 * Find all component files recursively
 */
function findComponentFiles(dir, extensions = ['.tsx', '.jsx']) {
  let files = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(findComponentFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

module.exports = {
  levenshteinDistance,
  findSimilarClasses,
  extractClassNames,
  parseTailwindConfig,
  parseGlobalsCss,
  hasIncorrectPrefix,
  suggestCorrectPrefix,
  findComponentFiles
};
