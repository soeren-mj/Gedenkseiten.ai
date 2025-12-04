# CLAUDE.md
# Gedenkseiten.ai - Project Instructions for Claude

## Project Overview
You are working on Gedenkseiten.ai, a digital memorial platform for creating commemorative pages for deceased persons and pets. The platform is built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Known Issues

### ~~Account Deletion - Foreign Key Constraints~~ ✅ GELÖST
- **Status:** ✅ GELÖST (2025-01-05) - Hard Delete funktioniert jetzt
- **Details:** See `docs/account-deletion-issue.md` for complete documentation
- **Problem (behoben):** Hard Delete schlug fehl wegen 3 FKs mit NO ACTION
- **Root Cause:** `memorial_invitations`, `memorials`, `users` hatten FKs ohne CASCADE
- **Lösung:** Alle 3 FKs via psql auf `ON DELETE CASCADE` geändert
- **Ergebnis:**
  - ✅ Hard Delete funktioniert - User wird permanent aus DB gelöscht
  - ✅ Email-Adressen können sofort wiederverwendet werden
  - ✅ GDPR-konform - keine User-Daten bleiben zurück
- **Betroffene Dateien:**
  - `src/app/api/user/delete-account/route.ts:300-342` - Hard Delete mit Soft Delete Fallback (funktioniert jetzt)
  - `src/components/settings/AccountDeletionModal.tsx` - Account Deletion UI
  - `src/app/api/user/deletion-summary/route.ts` - Deletion Preview API
  - `src/app/dashboard/settings/page.tsx:204-253` - Account Deletion Handler mit Redirect

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
- `docs/design-system/colors.md` - Color system and semantic tokens
- `docs/design-system/typography.md` - Typography scales and usage
- `docs/design-system/button.md` - Button component specifications
- `docs/auth-troubleshooting.md` - **Authentication issues, solutions, and debugging guide**
- `cursor-rules.txt` - Development guidelines and patterns

## Authentication Troubleshooting
**⚠️ IMPORTANT:** If you encounter authentication errors or issues, always check `docs/auth-troubleshooting.md` first.

Common auth issues documented:
- **getSession timeout errors** - Storage key misconfiguration and race conditions
- **Magic link callback problems** - Server vs client-side handling
- **Session not persisting** - Storage mechanism conflicts
- **Legacy client configuration** - Why we use it and how to configure it correctly

The troubleshooting guide includes:
- Root cause analysis for known issues
- Step-by-step solutions and fixes
- Best practices for auth configuration
- Debugging checklists and commands
- Architecture overview and design decisions

## Current Implementation Status
- ✅ Landing page with waitlist
- ✅ Project structure setup
- ✅ Design system implementation (colors, typography, buttons)
- ✅ Tailwind configuration with custom tokens
- ✅ CSS Variables System (Light/Dark Mode in globals.css)
- ✅ UI Components Library (Button, TextInput, TextArea, DateInput, Select, Autocomplete, Badge, Reactions)
- ✅ Authentication system (Phase 2 - Completed)
- ✅ Memorial creation flow (Phase 3 - Complete: Wizard + Management + Content)
- ✅ Memorial management pages (Stammdaten, Darstellung, Wissenswertes, Spruch/Nachruf, Privatsphäre)
- ✅ Production deployment ready (Linting errors fixed)
- ✅ Tier Basic Info page (Complete - all wizard steps working)
- ⏳ Reaktionen System (Next priority - UI component exists)
- ⏳ Termine (Events)
- ⏳ Public memorial pages
- ⏳ Additional content features (Kondolenzbuch, Erinnerungen)

## Phase 2: Authentication System ✅ COMPLETED
See `docs/auth-troubleshooting.md` for details.

## Phase 3: Memorial Creation Flow ✅ COMPLETE

### ✅ Completed (2025-01-11 + 2025-01-17 + 2025-01-24 + 2025-01-28 + 2025-12-01)

**Database & Infrastructure:**
- Supabase Types extended (Tierarten, Memorial fields, Wissenswertes)
- 9 DB Migrations created and executed (including wissenswertes table)
- Storage Bucket setup (`memorial-avatars`)
- RLS Policies configured
- Dependencies installed (react-hook-form, zod, react-easy-crop, date-fns, @dnd-kit/core, @dnd-kit/sortable)

**Components & Utils:**
- Form Components: Select, Autocomplete, InlineDatePicker, TextArea
- Memorial Components: WizardLayout, ProgressIndicator, InitialsPreview, AvatarSelection (reusable), StammdatenForm
- Wissenswertes Components: WissenswertesManager, WissenswertesForm, WissenswertesItem, WissenswertesSection, EmojiGrid
- Privacy Components: PrivacySelection (reusable)
- Spruch/Nachruf Components: SpruchInput, NachrufInput
- UI Components: Badge
- Hooks: useMemorialWizard, useLocalStorageDraft, useDebounce
- Utils: Zod Schemas, Date Validation, Initials Generator, Name Formatter
- Context: MemorialContext with state management and updateMemorial

**Wizard Routes (Implemented):**
- ✅ `/gedenkseite/neu` - Type Selection
- ✅ `/gedenkseite/neu/person` - Person Basic Info (fully refined)
- ✅ `/gedenkseite/neu/tier` - Pet Basic Info (Complete with Tierart/Rassengruppe/Rasse cascade)
- ✅ `/gedenkseite/neu/[type]/avatar` - Avatar Selection (reusable component)
- ✅ `/gedenkseite/neu/[type]/sichtbarkeit` - Privacy Settings (refactored with reusable PrivacySelection)
- ✅ `/gedenkseite/neu/[type]/zusammenfassung` - Summary & Creation

**API Endpoints (Implemented):**
- ✅ `POST /api/memorials` - Create Memorial
- ✅ `PATCH /api/memorials/[id]` - Update Memorial (extended with spruch, nachruf, privacy)
- ✅ `GET /api/animals/*` - Fetch Tierarten/Rassen
- ✅ `GET /api/memorials/[id]/wissenswertes` - Fetch Wissenswertes entries
- ✅ `POST /api/memorials/[id]/wissenswertes` - Create Wissenswertes entry
- ✅ `PATCH /api/memorials/[id]/wissenswertes` - Update Wissenswertes entry
- ✅ `DELETE /api/memorials/[id]/wissenswertes` - Delete Wissenswertes entry
- ✅ `POST /api/memorials/[id]/wissenswertes/reorder` - Reorder Wissenswertes entries

**Management Pages (Implemented):**
- ✅ `/gedenkseite/[id]/verwalten` - Overview Dashboard
- ✅ `/gedenkseite/[id]/verwalten/stammdaten` - Edit Basic Info
- ✅ `/gedenkseite/[id]/verwalten/darstellung` - Edit Avatar (with real-time sidebar updates)
- ✅ `/gedenkseite/[id]/verwalten/wissenswertes` - Manage Wissenswertes (drag & drop sorting, emoji selection, max 12 entries)
- ✅ `/gedenkseite/[id]/verwalten/spruch-nachruf` - Edit Spruch & Nachruf
- ✅ `/gedenkseite/[id]/verwalten/privatsphaere` - Privacy Settings

**Recent Improvements (2025-01-24):**
- ✅ Icon Avatar Support (PersonIcon/AnimalIcon rendering)
- ✅ Context Update Mechanism (real-time updates without page reload)
- ✅ Design System Alignment (Avatar sizes: sm=32px, md=40px, lg=48px, xl=64px)
- ✅ MemorialCard UX (2-line name wrapping, 40px avatar on desktop)
- ✅ Production Login Button Toggle (Environment variable based)
- ✅ All Linting Errors Fixed (22 errors: unused vars, any types, const issues)

**New Features (2025-01-28):**
- ✅ Wissenswertes System (Facts about the deceased with emoji icons)
  - Drag & drop reordering with @dnd-kit
  - Emoji selection grid (40 emojis)
  - Max 12 entries per memorial
  - Inline editing and deletion
- ✅ Spruch & Nachruf Management (Quote and Obituary)
  - Character limits (Spruch: 200, Nachruf: 2000)
  - Auto-save on change
- ✅ Privacy Settings Management Page
  - Reusable PrivacySelection component
  - Public/Private toggle with descriptions
- ✅ TextArea Component (multi-line input with character count)
- ✅ Badge Component (status indicators)
- ✅ Enhanced TextInput (search icon support, improved styling)

### ⏳ Pending (Next Priority)

**Reaktionen System (Quick Win):**
- Existing UI Component: `src/components/ui/Reactions.tsx`
  - 5 Reaction types: liebe, dankbarkeit, freiheit, blumen, kerze
  - SVG icons included
  - isSelected state for toggle behavior
  - onReactionClick handler
  - Counter per reaction (value)
- DB Migration: `memorial_reactions` table (user_id, memorial_id, reaction_type, unique constraint)
- API Endpoint: `POST /api/memorials/[id]/reactions` - Toggle reaction
- Integration: Connect existing Reactions component with backend

**Termine (Events):**
- DB Migration: `memorial_events` table
- API Endpoints: CRUD for events
- Event types: Beerdigung, Gedenkfeier, Jahrestag, Sonstiges
- UI: EventsManager + EventCard components

**Public Memorial Page:**
- `/gedenkseite/[id]` - Public view route (basic structure exists)
- Memorial Header Component (Avatar, Name, Dates)
- Wissenswertes Section Display (read-only)
- Spruch & Nachruf Display
- Reaction Bar integration
- View Counter display
- Privacy Check (public vs private access)

**Additional Content Features:**
- Kondolenzbuch (Guestbook with entries)
- Erinnerungen (Photo/Video gallery - Premium)

See session summaries for detailed implementation history:
- `/docs/SESSION-SUMMARY-2025-01-11.md` - Initial wizard implementation
- `/docs/SESSION-SUMMARY-2025-01-12.md` - Stammdaten form refinement
- `/docs/SESSION-SUMMARY-2025-01-24.md` - Icon support, context updates, production readiness
- `/docs/SESSION-SUMMARY-2025-01-28.md` - Wissenswertes, Spruch/Nachruf, Privacy management

## Development Workflow
1. Always check the technical documentation before implementing features
2. Use TypeScript for all new files
3. Follow the component structure in .cursorrules
4. Test in both light and dark modes
5. Ensure mobile responsiveness
6. Handle loading and error states
7. Use German text for all UI elements

## ⚠️ Component Reuse First (WICHTIG)

**Bevor neue Komponenten, Elemente oder Funktionen erstellt werden:**

1. **Prüfen ob bereits vorhanden:**
   - Suche in `src/components/ui/` nach ähnlichen Komponenten
   - Prüfe `src/lib/utils/` für Helper-Funktionen
   - Schaue in bestehende Pages nach ähnlichen Patterns

2. **User informieren:**
   - Melde gefundene existierende Komponenten/Funktionen
   - Erkläre wie sie wiederverwendet werden können
   - Zeige Beispiel-Usage aus dem Codebase

3. **Wiederverwendung bevorzugen:**
   - Eine Komponente, überall nutzen (wie in Figma)
   - Änderungen nur an einer Stelle nötig
   - Konsistentes Styling garantiert

4. **Performance beachten:**
   - Shared Components werden gecached
   - Keine doppelten Bundle-Größen
   - Weniger Code = schnellere Builds

**Beispiel bestehender wiederverwendbarer Komponenten:**
- `InitialsAvatar` - Avatar mit Initialen-Fallback (Sidebar, Navbar, Reaktionen)
- `Button` - Alle Button-Varianten (primary, secondary, tertiary, etc.)
- `TextInput` - Form-Inputs mit Label, Error, Hint
- `PrivacySelection` - Öffentlich/Privat Toggle
- `AvatarSelection` - Avatar-Upload mit Crop

## 🧹 Dead Code Detection

**Beim Durchgehen des Codes aktiv nach ungenutztem Code suchen:**

1. **Was prüfen:**
   - Ungenutzte Imports
   - Ungenutzte Funktionen/Variablen
   - Verwaiste Komponenten (nirgends importiert)
   - Auskommentierter Code
   - Alte/veraltete Helper-Funktionen

2. **User informieren:**
   - Melde gefundenen Dead Code mit Datei + Zeile
   - Erkläre warum es Dead Code ist
   - Schlage Entfernung vor

3. **Warum wichtig:**
   - Codebase bleibt clean und übersichtlich
   - Kleinere Bundle-Größe
   - Einfachere Wartung
   - Keine Verwirrung durch alten Code

**Beispiel-Meldung:**
```
⚠️ Dead Code gefunden:
- `src/components/Navbar.tsx:142-148` - `getUserInitials()` Funktion wird nicht mehr verwendet (InitialsAvatar macht das intern)
- Soll ich das entfernen?
```

## Common Commands
```bash
# Development
npm run dev

# Type checking
npm run type-check

# Build
npm run build

# Database types generation (when schema changes)
npm run supabase:types

# Install dependencies
npm install
```

## File Structure
```
app/                 # Next.js App Router
├── auth/           # Authentication pages
│   ├── login/
│   └── callback/
├── dashboard/      # Protected user area
└── layout.tsx      # Root layout with providers

components/
├── ui/             # Reusable UI components
├── dashboard/      # Dashboard-specific components
├── auth/           # Authentication components
└── providers/      # Context providers

contexts/           # React contexts
├── AuthContext.tsx

hooks/              # Custom React hooks
├── useRequireAuth.ts

lib/
├── supabase/       # Supabase configuration
│   ├── client.ts
│   ├── server.ts
│   ├── middleware.ts
│   └── auth-helpers.ts
└── utils.ts        # Utility functions

middleware.ts       # Next.js middleware for auth

docs/               # All documentation
public/             # Static assets
```

## Available UI Components
### Button Component
- Location: `components/ui/Button.tsx`
- Variants: primary, secondary, tertiary, positive, negative
- Sizes: xs, sm, md, lg
- Always include loading and disabled states
- Reference: `docs/design-system/button.md`

### TextInput Component
- Location: `components/ui/text-input.tsx`
- Sizes: sm, md
- Features: label, placeholder, leading icon (search), clear button, hint text, error states
- States: default, hover, active, error, done
- Accessibility compliant with proper ARIA attributes

## Design System Usage
### CSS Variables System
- ✅ **globals.css** contains all CSS variables for Light and Dark mode
- ✅ **Automatic theme switching** - no manual dark: classes needed
- ✅ **Use semantic classes**: `bg-primary`, `text-primary`, `border-main`, etc.
- ✅ **Color system works automatically** for both light and dark themes

### Colors
- Use semantic Tailwind classes: `bg-primary`, `text-secondary`, `border-main`
- CSS variables handle light/dark mode automatically
- Available: `bg-bw`, `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-accent`
- Text colors: `text-primary`, `text-secondary`, `text-tertiary`
- Interactive colors: `bg-interactive-primary-default`, `text-interactive-disabled`

### Typography
- Utility classes available: `text-body-s`, `text-body-m`, `text-body-l`
- Headings: `text-hero-h1`, `text-section-h2`, `text-subsection-h3`
- Button text: `text-button-s`, `text-button-m`, `text-button-l`
- All classes include proper font-family, weight, size, line-height, letter-spacing

### Border Radius
- Tokens: `rounded-none`, `rounded-xxs`, `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- Use design tokens instead of arbitrary values

## React Hook Form Best Practices
### Prop Order in forwardRef Components
⚠️ **CRITICAL:** When creating custom input components with `forwardRef`, always spread `{...props}` BEFORE custom handlers:
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
**Why:** React Hook Form's `onChange` must be called. Spreading after custom handlers overrides them.

### Field Watching Pattern
Use subscription pattern with proper cleanup:
```tsx
useEffect(() => {
  const subscription = watch((value) => {
    // Handle value changes
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

### Form Buttons Outside Forms
Use HTML5 `form` attribute to connect buttons to forms:
```tsx
<form id="my-form" onSubmit={handleSubmit(onSubmit)}>
  {/* form fields */}
</form>

{/* Somewhere else in layout */}
<Button type="submit" form="my-form">Submit</Button>
```

### Sticky Layout Pattern
For wizard-style layouts with persistent navigation:
```tsx
<main className="flex flex-col h-full">
  <div className="sticky top-0">Top Bar</div>
  <div className="flex-1 overflow-y-auto">Scrollable Content</div>
  <div className="sticky bottom-0">Footer Buttons</div>
</main>
```

## Authentication Flow
1. User clicks "Jetzt voranmelden" → Login page
2. Choose auth method (Social or Email)
3. Email → Magic link sent → Verify email
4. Success → Redirect to dashboard
5. Dashboard shows empty state or invitations

## Important Reminders
- **Date Format Strategy:**
  - **Storage:** ISO format (YYYY-MM-DD) for database compatibility
  - **Display:** German format (DD.MM.YYYY) using `date-fns`
  - **Validation:** ISO format in Zod schemas
- **Design System Colors:**
  - ⚠️ **ALWAYS check `globals.css` for semantic color variables first**
  - Use `text-interactive-disabled` instead of `opacity-50`
  - Ensures consistent theming across light/dark modes
- Privacy levels: Public and Private (invite-only)
- User roles: Member and Administrator
- Error messages must be user-friendly and in German
- Loading states with German text ("Laden...")
- Mobile-first responsive design
- Accessibility: WCAG 2.1 AA compliance

## Database Schema (Auth)
```sql
-- Profiles table linked to Supabase auth
profiles:
  - id (UUID, references auth.users)
  - email (unique)
  - full_name
  - avatar_url
  - account_type (free/premium)
  - created_at/updated_at

-- Invitations for memorial access
memorial_invitations:
  - id
  - memorial_id
  - invited_email
  - invited_by
  - role (member/administrator)
  - status (pending/accepted/declined)
```

## Next Steps
1. ✅ Complete Button component with all variants
2. ✅ Set up Supabase client configuration
3. ✅ Implement authentication flow
4. ⏳ Add email template customization
5. ⏳ Implement invitation system
6. ⏳ Create memorial type selection modal
7. ⏳ Build memorial creation flow

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