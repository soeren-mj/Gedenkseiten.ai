# CLAUDE.md
# Gedenkseiten.ai - Project Instructions for Claude

## Project Overview
You are working on Gedenkseiten.ai, a digital memorial platform for creating commemorative pages for deceased persons and pets. The platform is built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Critical Project Context
- **Language**: All UI text must be in German, code comments in English
- **Design System**: Strict adherence to custom design tokens (see docs/)
- **User Journey**: Follow the detailed flows in docs/technical-documentation.md
- **Authentication**: Magic link (passwordless) email authentication with optional OAuth
- **Database**: PostgreSQL via Supabase
- **Styling**: Tailwind CSS with custom configuration
- **State Management**: React Context API
- **Dark Mode**: Fully supported with next-themes

## Key Documentation Files
- `docs/technical-documentation.md` - Complete user flows and features
- `docs/IMPLEMENTATION-STATUS.md` - Phase 3 details, pending features, session summaries
- `docs/design-system/colors.md` - Color system and semantic tokens
- `docs/design-system/typography.md` - Typography scales and usage
- `docs/design-system/button.md` - Button component specifications
- `docs/auth-troubleshooting.md` - Authentication issues, solutions, and debugging guide
- `cursor-rules.txt` - Development guidelines and patterns

## Known Issues
- ~~Account Deletion~~ SOLVED - See `docs/account-deletion-issue.md`

## Current Implementation Status
- Landing page with waitlist
- Project structure setup
- Design system implementation (colors, typography, buttons)
- Tailwind configuration with custom tokens
- CSS Variables System (Light/Dark Mode in globals.css)
- UI Components Library (Button, TextInput, TextArea, DateInput, Select, Autocomplete, Badge, Reactions)
- Authentication system (Phase 2 - Completed)
- Memorial creation flow (Phase 3 - Complete: Wizard + Management + Content)
- Memorial management pages (Stammdaten, Darstellung, Wissenswertes, Spruch/Nachruf, Privatsphare)
- Production deployment ready
- Tier Basic Info page (Complete - all wizard steps working)
- Reaktionen System (Next priority - UI component exists)
- Termine (Events)
- Public memorial pages
- Additional content features (Kondolenzbuch, Erinnerungen)

See `docs/IMPLEMENTATION-STATUS.md` for detailed feature status.

## Authentication Troubleshooting
If you encounter authentication errors, check `docs/auth-troubleshooting.md` first.

Common issues documented:
- getSession timeout errors - Storage key misconfiguration and race conditions
- Magic link callback problems - Server vs client-side handling
- Session not persisting - Storage mechanism conflicts
- Legacy client configuration - Why we use it and how to configure it correctly

## Development Workflow
1. Always check the technical documentation before implementing features
2. Use TypeScript for all new files
3. Follow the component structure in .cursorrules
4. Test in both light and dark modes
5. Ensure mobile responsiveness
6. Handle loading and error states
7. Use German text for all UI elements

## Component Reuse First (WICHTIG)

**STOP - Bevor du IRGENDEINEN Button, Input, Checkbox, Card, etc. erstellst:**

1. **Zuerst prufen:**
   - `ls src/components` wichtig! hier sind alle Komponenten drin! 
   - `ls src/components/ui/` ausfuhren
   - `ls src/components/icons/` fur Icons
   - Existierende Komponente suchen
   - Bei Unsicherheit: User fragen

2. **NIE eigene Implementierung erstellen von:**
   - Buttons, Inputs, Checkboxen, Selects
   - Cards, Modals, Badges
   - Icons (prufe `src/components/icons/`)

3. **Wenn Komponente existiert aber anders aussieht:**
   - User fragen ob bestehende erweitert werden soll
   - NICHT einfach neue erstellen

**Verfugbare UI Komponenten zum Beispiel:**
| Komponente | Location | Features |
|------------|----------|----------|
| `Button` | `components/ui/Button.tsx` | Variants: primary, secondary, tertiary, positive, negative. Sizes: xs, sm, md, lg |
| `TextInput` | `components/ui/text-input.tsx` | Label, placeholder, leading icon, clear button, hint, error states |
| `TextArea` | `components/ui/TextArea.tsx` | Multi-line input with character count |
| `Checkbox` | `components/ui/Checkbox.tsx` | Checkbox with label and error |
| `Select` | `components/ui/Select.tsx` | Dropdown select |
| `Badge` | `components/ui/Badge.tsx` | Status indicators |
| `Toast` | `components/ui/Toast.tsx` + `contexts/ToastContext.tsx` | Types: success, error, info, warning. Usage: `useToast()` |
| `InitialsAvatar` | `components/ui/InitialsAvatar.tsx` | Avatar with initials fallback |
| `PrivacySelection` | Reusable | Public/Private toggle |
| `AvatarSelection` | Reusable | Avatar upload with crop |
| `HubCard` | `components/memorial/HubCard.tsx` | Card with frame effect |

## Design Consistency Check (WICHTIG)

**Bevor neue UI-Komponenten erstellt werden:**

1. **Bestehende Komponenten als Referenz:**
   - Schaue in `src/components/` nach ahnlichen Komponenten
   - Identifiziere das Design-Pattern (Container-Struktur, Schatten, Border)
   - Neue Komponenten MUSSEN dem gleichen Pattern folgen

2. **Screenshots konsultieren:**
   - Prufe `docs/Screenshots-*` fur visuelle Referenz
   - Vergleiche mit existierenden Seiten (z.B. /dashboard)

3. **Bei Cards speziell:**
   - Referenz: `src/components/cards/MemorialCard.tsx`
   - Doppelter Container (Frame-Effekt):
     - Auerer: `bg-bw-opacity-40 rounded-md shadow-card p-1`
     - Innerer: `bg-light-dark-mode rounded-sm`
   - `shadow-card` statt `border border-card`

## Dead Code Detection

**Beim Durchgehen des Codes aktiv nach ungenutztem Code suchen:**

1. **Was prufen:**
   - Ungenutzte Imports
   - Ungenutzte Funktionen/Variablen
   - Verwaiste Komponenten (nirgends importiert)
   - Auskommentierter Code

2. **User informieren:**
   - Melde gefundenen Dead Code mit Datei + Zeile
   - Erklare warum es Dead Code ist
   - Schlage Entfernung vor

## Design System Usage

### CSS Variables System
- `globals.css` contains all CSS variables for Light and Dark mode
- Automatic theme switching - no manual `dark:` classes needed
- Use semantic classes: `bg-primary`, `text-primary`, `border-main`, etc.

### Colors
- Use semantic Tailwind classes: `bg-primary`, `text-secondary`, `border-main`
- Available: `bg-bw`, `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-accent`
- Text colors: `text-primary`, `text-secondary`, `text-tertiary`
- Interactive colors: `bg-interactive-primary-default`, `text-interactive-disabled`
- Use `text-interactive-disabled` instead of `opacity-50` for disabled states

### Typography
- Body: `text-body-s`, `text-body-m`, `text-body-l`
- Headings: `text-hero-h1`, `text-section-h2`, `text-subsection-h3`
- Button text: `text-button-s`, `text-button-m`, `text-button-l`

### Border Radius
- Tokens: `rounded-none`, `rounded-xxs`, `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- Use design tokens instead of arbitrary values

## React Hook Form Best Practices

### Prop Order in forwardRef Components
When creating custom input components with `forwardRef`, always spread `{...props}` BEFORE custom handlers:
```tsx
<select
  ref={ref}
  {...props}  // MUST come BEFORE custom onChange
  onChange={(e) => {
    // Custom logic
    props.onChange?.(e);
  }}
>
```

### Field Watching Pattern
```tsx
useEffect(() => {
  const subscription = watch((value) => {
    // Handle value changes
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

### Form Buttons Outside Forms
```tsx
<form id="my-form" onSubmit={handleSubmit(onSubmit)}>
  {/* form fields */}
</form>
<Button type="submit" form="my-form">Submit</Button>
```

### Sticky Layout Pattern
```tsx
<main className="flex flex-col h-full">
  <div className="sticky top-0">Top Bar</div>
  <div className="flex-1 overflow-y-auto">Scrollable Content</div>
  <div className="sticky bottom-0">Footer Buttons</div>
</main>
```

## Important Reminders
- **Date Format:** Storage=ISO (YYYY-MM-DD), Display=German (DD.MM.YYYY) using `date-fns`
- **Privacy levels:** Public and Private (invite-only)
- **User roles:** Member and Administrator
- **Error messages:** User-friendly and in German
- **Loading states:** German text ("Laden...")
- **Mobile-first:** Responsive design
- **Accessibility:** WCAG 2.1 AA compliance

## Common Commands
```bash
npm run dev          # Development
npm run type-check   # Type checking
npm run build        # Build
npm run supabase:types  # Database types generation
npm install          # Install dependencies
```

## File Structure
```
app/                 # Next.js App Router
  auth/             # Authentication pages
  dashboard/        # Protected user area
components/
  ui/               # Reusable UI components
  dashboard/        # Dashboard-specific components
  auth/             # Authentication components
  providers/        # Context providers
contexts/           # React contexts
hooks/              # Custom React hooks
lib/
  supabase/         # Supabase configuration
docs/               # All documentation
public/             # Static assets
```

## Database Schema (Auth)
```sql
profiles:
  - id (UUID, references auth.users)
  - email (unique)
  - full_name
  - avatar_url
  - account_type (free/premium)
  - created_at/updated_at

memorial_invitations:
  - id
  - memorial_id
  - invited_email
  - invited_by
  - role (member/administrator)
  - status (pending/accepted/declined)
```

## Testing Checklist
- [ ] Magic link email flow
- [ ] OAuth provider login (Google, Apple, Microsoft)
- [ ] Protected route access
- [ ] Dashboard empty state
- [ ] Invitation display
- [ ] Dark mode toggle
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states

When implementing any feature, always:
1. Check if it's documented in docs/technical-documentation.md
2. Use the correct design tokens from our design system
3. Follow TypeScript best practices
4. Test the German user experience
5. Ensure proper error handling and loading states
