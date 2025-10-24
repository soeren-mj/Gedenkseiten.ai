#!/usr/bin/env node

/**
 * Design System Validation Script
 *
 * Validates:
 * - Tailwind class names against tailwind.config.js
 * - Design token compliance (semantic classes)
 * - Responsive design patterns
 *
 * Exit codes:
 * - 0: No errors
 * - 1: Validation errors found
 */

const fs = require('fs');
const path = require('path');
const {
  extractClassNames,
  parseTailwindConfig,
  parseGlobalsCss,
  hasIncorrectPrefix,
  suggestCorrectPrefix,
  findSimilarClasses,
  findComponentFiles
} = require('./helpers');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

// Configuration
const CONFIG = {
  projectRoot: path.resolve(__dirname, '../..'),
  tailwindConfigPath: path.resolve(__dirname, '../../tailwind.config.js'),
  globalsCssPath: path.resolve(__dirname, '../../src/app/globals.css'),
  componentsDir: path.resolve(__dirname, '../../src/components'),
  excludePatterns: [
    'node_modules',
    '.next',
    'build',
    'dist'
  ]
};

/**
 * Main validation function
 */
async function validateDesignSystem(filePaths = null) {
  console.log(`${colors.bold}${colors.cyan}Design System Validation${colors.reset}\n`);

  // Parse design system configuration
  console.log(`${colors.gray}Parsing design system configuration...${colors.reset}`);
  const tailwindClasses = parseTailwindConfig(CONFIG.tailwindConfigPath);
  const cssVariables = parseGlobalsCss(CONFIG.globalsCssPath);

  // Build list of all valid semantic classes
  const validClasses = [
    ...tailwindClasses.backgroundColor,
    ...tailwindClasses.textColor,
    ...tailwindClasses.borderColor,
    ...tailwindClasses.placeholderColor,
    ...tailwindClasses.borderRadius
  ];

  console.log(`${colors.green}✓ Found ${validClasses.length} semantic classes${colors.reset}\n`);

  // Find files to validate
  let files = [];
  if (filePaths && filePaths.length > 0) {
    files = filePaths;
  } else {
    files = findComponentFiles(CONFIG.componentsDir);
  }

  console.log(`${colors.gray}Validating ${files.length} component files...${colors.reset}\n`);

  // Validation results
  const results = {
    totalFiles: files.length,
    totalClasses: 0,
    errors: [],
    warnings: []
  };

  // Validate each file
  for (const filePath of files) {
    const relativePath = path.relative(CONFIG.projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const classNames = extractClassNames(content);

    results.totalClasses += classNames.length;

    for (const { class: className, line } of classNames) {
      // Skip Tailwind utility classes (e.g., flex, grid, p-4, etc.)
      if (isStandardTailwindUtility(className)) {
        continue;
      }

      // Check for incorrect prefix patterns
      if (hasIncorrectPrefix(className)) {
        const suggestion = suggestCorrectPrefix(className);
        results.errors.push({
          file: relativePath,
          line,
          class: className,
          type: 'incorrect-prefix',
          message: `Incorrect prefix pattern`,
          suggestion
        });
        continue;
      }

      // Check if class exists in our semantic tokens
      const isSemanticClass = validClasses.includes(className);

      if (!isSemanticClass && isCustomSemanticPattern(className)) {
        // Check for non-existent semantic classes
        const suggestions = findSimilarClasses(className, validClasses, 3);

        results.errors.push({
          file: relativePath,
          line,
          class: className,
          type: 'invalid-class',
          message: `Class does not exist in design system`,
          suggestions
        });
      }
    }

    // Check responsive patterns
    const responsiveIssues = checkResponsivePatterns(content);
    for (const issue of responsiveIssues) {
      results.warnings.push({
        file: relativePath,
        ...issue
      });
    }
  }

  // Print results
  printResults(results);

  // Exit with error code if validation failed
  return results.errors.length === 0 ? 0 : 1;
}

/**
 * Check if a class is a standard Tailwind utility or custom typography class
 * (we only validate custom semantic classes)
 */
function isStandardTailwindUtility(className) {
  // Standard Tailwind prefixes and utilities
  const standardPrefixes = [
    'flex', 'grid', 'block', 'inline', 'hidden',
    'w-', 'h-', 'min-', 'max-',
    'p-', 'm-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-',
    'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
    'gap-', 'space-',
    'items-', 'justify-', 'self-', 'content-',
    'overflow-', 'whitespace-',
    'cursor-', 'pointer-events-',
    'transition-', 'duration-', 'ease-', 'delay-',
    'transform', 'scale-', 'rotate-', 'translate-',
    'opacity-',
    'shadow-',
    'z-',
    'absolute', 'relative', 'fixed', 'sticky',
    'top-', 'bottom-', 'left-', 'right-', 'inset-',
    'font-', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
    'text-4xl', 'text-5xl', 'text-6xl',
    'leading-', 'tracking-',
    'uppercase', 'lowercase', 'capitalize',
    'italic', 'not-italic',
    'underline', 'line-through', 'no-underline',
    'text-left', 'text-center', 'text-right', 'text-justify',
    'align-', 'vertical-',
    'hover:', 'focus:', 'active:', 'group-hover:', 'disabled:',
    'md:', 'lg:', 'xl:', 'sm:', '2xl:',
    'dark:',
    'border-0', 'border-2', 'border-4', 'border-8',
    'border-t-', 'border-b-', 'border-l-', 'border-r-',
    'border-solid', 'border-dashed', 'border-dotted', 'border-none',
    'ring-0', 'ring-1', 'ring-2', 'ring-4', 'ring-8',
    'ring-offset-0', 'ring-offset-1', 'ring-offset-2', 'ring-offset-4', 'ring-offset-8',
    'focus-visible:', 'focus-within:',
    'outline-', 'aria-',
    'animate-'
  ];

  // Standard Tailwind utilities (exact matches)
  const standardUtilities = [
    'group', 'container', 'sr-only',
    'rounded-full', 'rounded-none',
    'aspect-square', 'aspect-video'
  ];

  // Custom typography classes from globals.css
  const customTypography = [
    'text-hero-h1', 'text-section-h2', 'text-subsection-h3', 'text-title-body-h4', 'text-title-group-h5',
    'text-body-l', 'text-body-m', 'text-body-m-semibold', 'text-body-s', 'text-body-s-semibold',
    'text-body-xs', 'text-body-xs-semibold',
    'text-button-l', 'text-button-m', 'text-button-s', 'text-button-xs',
    'text-tag', 'text-chip',
    'text-webapp-title', 'text-webapp-section', 'text-webapp-subsection', 'text-webapp-body', 'text-webapp-group',
    'text-body-m-responsive', 'text-body-s-responsive', 'text-button-m-responsive',
    'text-gradient-night-is-coming', 'text-gradient-warm-sunset', 'text-gradient-garden-floristic', 'text-gradient-hot-hell'
  ];

  // Check exact match first
  if (standardUtilities.includes(className) || customTypography.includes(className)) {
    return true;
  }

  // Check if class starts with any standard prefix
  return standardPrefixes.some(prefix => className.startsWith(prefix));
}

/**
 * Check if a class follows our custom semantic pattern
 * (bg-*, text-*, border-*, etc.)
 */
function isCustomSemanticPattern(className) {
  const semanticPrefixes = [
    'bg-',
    'text-',
    'border-',
    'placeholder-',
    'rounded-',
    'ring-'
  ];

  return semanticPrefixes.some(prefix => className.startsWith(prefix));
}

/**
 * Check for responsive design patterns
 */
function checkResponsivePatterns(content) {
  const issues = [];

  // Check for desktop-first patterns (should be mobile-first)
  const desktopFirstPattern = /className="[^"]*\s(lg|xl|2xl):[^\s"]*/g;
  let match;
  while ((match = desktopFirstPattern.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;

    // Check if there's a base class without breakpoint
    const classNameMatch = content.substring(match.index).match(/className="([^"]*)"/);
    if (classNameMatch) {
      const allClasses = classNameMatch[1];
      const hasBaseClass = !/^(lg|xl|2xl):/.test(allClasses.trim());

      if (!hasBaseClass) {
        issues.push({
          line: lineNumber,
          type: 'responsive-pattern',
          message: 'Possible desktop-first pattern. Consider mobile-first approach.',
          details: match[0]
        });
      }
    }
  }

  return issues;
}

/**
 * Print validation results to console
 */
function printResults(results) {
  console.log(`${colors.bold}Validation Results:${colors.reset}`);
  console.log(`${colors.gray}Files: ${results.totalFiles}${colors.reset}`);
  console.log(`${colors.gray}Total classes checked: ${results.totalClasses}${colors.reset}\n`);

  // Print errors
  if (results.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}✗ ${results.errors.length} Error(s):${colors.reset}\n`);

    for (const error of results.errors) {
      console.log(`${colors.red}Error:${colors.reset} ${error.file}:${error.line}`);
      console.log(`  ${colors.yellow}Class:${colors.reset} ${colors.bold}${error.class}${colors.reset}`);
      console.log(`  ${colors.gray}${error.message}${colors.reset}`);

      if (error.suggestion) {
        console.log(`  ${colors.green}Suggestion:${colors.reset} ${error.suggestion}`);
      }

      if (error.suggestions && error.suggestions.length > 0) {
        console.log(`  ${colors.green}Did you mean:${colors.reset}`);
        error.suggestions.forEach(suggestion => {
          console.log(`    - ${suggestion}`);
        });
      }

      console.log('');
    }
  } else {
    console.log(`${colors.green}${colors.bold}✓ No errors found${colors.reset}\n`);
  }

  // Print warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}⚠ ${results.warnings.length} Warning(s):${colors.reset}\n`);

    for (const warning of results.warnings) {
      console.log(`${colors.yellow}Warning:${colors.reset} ${warning.file}:${warning.line}`);
      console.log(`  ${colors.gray}${warning.message}${colors.reset}`);
      if (warning.details) {
        console.log(`  ${colors.gray}${warning.details}${colors.reset}`);
      }
      console.log('');
    }
  }

  // Summary
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log(`${colors.green}${colors.bold}✓ All checks passed!${colors.reset}`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  validateDesignSystem(args.length > 0 ? args : null)
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error(`${colors.red}Fatal error:${colors.reset}`, error);
      process.exit(1);
    });
}

module.exports = { validateDesignSystem };
