#!/bin/bash

# User-Prompt Submit Hook for Design Review
# Automatically triggers design review when component files are modified

# Check if design review should be skipped
if [ "$SKIP_DESIGN_REVIEW" = "1" ]; then
  exit 0
fi

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Check for modified component files since last commit
MODIFIED_COMPONENTS=$(git -C "$PROJECT_ROOT" diff --name-only HEAD 2>/dev/null | grep -E '^src/components/.*\.(tsx|jsx)$' || true)

# If no components modified, exit silently
if [ -z "$MODIFIED_COMPONENTS" ]; then
  exit 0
fi

# Count modified components
COMPONENT_COUNT=$(echo "$MODIFIED_COMPONENTS" | wc -l | tr -d ' ')

# Output notification to user
cat << EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 Design Review: $COMPONENT_COUNT component(s) modified
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modified files:
$MODIFIED_COMPONENTS

Running design system validation...

EOF

# Run design review validation on modified files
MODIFIED_FILES_ARGS=""
while IFS= read -r file; do
  MODIFIED_FILES_ARGS="$MODIFIED_FILES_ARGS $PROJECT_ROOT/$file"
done <<< "$MODIFIED_COMPONENTS"

# Run the validation script
node "$PROJECT_ROOT/scripts/design-review/validate-design-system.js" $MODIFIED_FILES_ARGS

VALIDATION_EXIT_CODE=$?

if [ $VALIDATION_EXIT_CODE -eq 0 ]; then
  cat << EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Design review passed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
else
  cat << EOF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Design system issues detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 To automatically review and fix issues, you can:
   - Ask me to review the issues
   - Use: "Please review the design system issues"
   - Run manually: npm run design:review

💡 To skip this check temporarily:
   - Set environment variable: export SKIP_DESIGN_REVIEW=1

EOF
fi

# Always exit 0 to not block the user's workflow
# The agent can be triggered manually if needed
exit 0
