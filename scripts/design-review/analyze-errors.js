#!/usr/bin/env node

/**
 * Analyze and group design system validation errors
 */

const { execSync } = require('child_process');

try {
  // Run validation and capture output
  const output = execSync('npm run design:review 2>&1', {
    cwd: require('path').resolve(__dirname, '../..'),
    encoding: 'utf-8'
  });

  // Parse errors from output
  const errorLines = output.split('\n');
  const errors = [];

  for (let i = 0; i < errorLines.length; i++) {
    const line = errorLines[i];

    // Match error pattern: "Error: src/components/..."
    if (line.includes('Error:') && line.includes('src/components/')) {
      const fileMatch = line.match(/src\/components\/[^\s:]+:(\d+)/);
      if (fileMatch) {
        const file = fileMatch[0].split(':')[0];
        const lineNum = fileMatch[1];

        // Get class name from next line
        let className = '';
        if (i + 1 < errorLines.length) {
          const classMatch = errorLines[i + 1].match(/Class:\s*\[1m([^\[]+)\[0m/);
          if (classMatch) {
            className = classMatch[1];
          }
        }

        // Get issue type
        let issueType = 'unknown';
        if (i + 2 < errorLines.length) {
          if (errorLines[i + 2].includes('Incorrect prefix pattern')) {
            issueType = 'incorrect-prefix';
          } else if (errorLines[i + 2].includes('does not exist')) {
            issueType = 'non-existent';
          }
        }

        errors.push({ file, lineNum, className, issueType });
      }
    }
  }

  // Group errors by category
  const byType = {
    'arbitrary-values': [],
    'hardcoded-colors': [],
    'incorrect-prefix': [],
    'opacity-variants': [],
    'standard-tailwind': [],
    'other': []
  };

  for (const error of errors) {
    const { className, issueType } = error;

    if (className.includes('[') && className.includes(']')) {
      // Arbitrary values: rounded-[20px], text-[#fff]
      if (className.includes('#')) {
        byType['hardcoded-colors'].push(error);
      } else {
        byType['arbitrary-values'].push(error);
      }
    } else if (issueType === 'incorrect-prefix') {
      byType['incorrect-prefix'].push(error);
    } else if (className.includes('/')) {
      byType['opacity-variants'].push(error);
    } else if (className.match(/^(text|bg|border)-(white|black|red|green|yellow|blue|gray|purple|pink)-/)) {
      byType['hardcoded-colors'].push(error);
    } else if (className.match(/^(border-[tb]|border-[1-9]|bg-gradient|text-transparent|bg-clip|text-muted)/)) {
      byType['standard-tailwind'].push(error);
    } else {
      byType['other'].push(error);
    }
  }

  // Group by file
  const byFile = {};
  for (const error of errors) {
    if (!byFile[error.file]) {
      byFile[error.file] = [];
    }
    byFile[error.file].push(error);
  }

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 DESIGN SYSTEM VALIDATION - ERROR ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Total Errors: ${errors.length}\n`);

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ ERRORS BY CATEGORY                                          │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  Object.entries(byType).forEach(([type, errs]) => {
    if (errs.length > 0) {
      const typeLabels = {
        'arbitrary-values': '🔢 Arbitrary Values (rounded-[20px], text-[1rem])',
        'hardcoded-colors': '🎨 Hardcoded Colors (text-[#fff], bg-white)',
        'incorrect-prefix': '⚠️  Incorrect Prefix (bg-background-*, text-foreground-*)',
        'opacity-variants': '🌫️  Opacity Variants (bg-primary/60)',
        'standard-tailwind': '📦 Missing Standard Tailwind (border-t, bg-gradient-to-r)',
        'other': '❓ Other Issues'
      };

      console.log(`  ${typeLabels[type]}`);
      console.log(`  Count: ${errs.length}\n`);

      // Show first 5 examples
      errs.slice(0, 5).forEach(err => {
        console.log(`    • ${err.className} (${err.file}:${err.lineNum})`);
      });

      if (errs.length > 5) {
        console.log(`    ... and ${errs.length - 5} more\n`);
      } else {
        console.log('');
      }
    }
  });

  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ TOP 10 FILES WITH MOST ERRORS                               │');
  console.log('└─────────────────────────────────────────────────────────────┘\n');

  const sortedFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  sortedFiles.forEach(([file, errs], index) => {
    const fileName = file.split('/').pop();
    const padding = ' '.repeat(Math.max(0, 40 - fileName.length));
    console.log(`  ${index + 1}. ${fileName}${padding}${errs.length} errors`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  // Create detailed breakdown file
  const fs = require('fs');
  const detailedReport = [];

  detailedReport.push('# Design System Validation - Detailed Error Report\n');
  detailedReport.push(`**Total Errors:** ${errors.length}\n`);
  detailedReport.push('---\n\n');

  // By category
  detailedReport.push('## Errors by Category\n\n');
  Object.entries(byType).forEach(([type, errs]) => {
    if (errs.length > 0) {
      const typeLabels = {
        'arbitrary-values': 'Arbitrary Values',
        'hardcoded-colors': 'Hardcoded Colors',
        'incorrect-prefix': 'Incorrect Prefix Pattern',
        'opacity-variants': 'Opacity Variants',
        'standard-tailwind': 'Missing Standard Tailwind',
        'other': 'Other Issues'
      };

      detailedReport.push(`### ${typeLabels[type]} (${errs.length})\n\n`);

      errs.forEach(err => {
        detailedReport.push(`- \`${err.className}\` in ${err.file}:${err.lineNum}\n`);
      });

      detailedReport.push('\n');
    }
  });

  // By file
  detailedReport.push('## Errors by File\n\n');
  Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([file, errs]) => {
      detailedReport.push(`### ${file} (${errs.length} errors)\n\n`);

      errs.forEach(err => {
        detailedReport.push(`- Line ${err.lineNum}: \`${err.className}\`\n`);
      });

      detailedReport.push('\n');
    });

  const reportPath = require('path').resolve(__dirname, '../../design-system-errors.md');
  fs.writeFileSync(reportPath, detailedReport.join(''));

  console.log(`📄 Detailed report saved to: design-system-errors.md\n`);

} catch (error) {
  // Script will exit with error code, which is expected
}
