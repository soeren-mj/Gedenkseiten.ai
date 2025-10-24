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
- `docs/design-system/colors.md` - Color system and semantic tokens
- `docs/design-system/typography.md` - Typography scales and usage
- `docs/design-system/button.md` - Button component specifications
- `cursor-rules.txt` - Development guidelines and patterns

## Current Implementation Status
- ✅ Landing page with waitlist
- ✅ Project structure setup
- ✅ Design system implementation (colors, typography, buttons)
- ✅ Tailwind configuration with custom tokens
- ✅ CSS Variables System (Light/Dark Mode in globals.css)
- ✅ UI Components Library (Button, TextInput)
- ⏳ Authentication system (Phase 2 - In Progress)
- ⏳ Memorial creation flow
- ⏳ Public memorial pages
- ⏳ Admin features

## Phase 2: Authentication System - Requirements
1. **Magic Link Authentication**
   - Primary auth method via Supabase
   - German DOI (Double Opt-In) compliance
   - Email templates in German

2. **OAuth Providers**
   - Google, Apple, Microsoft
   - Passkey (future implementation)
   - Redirect to dashboard after success

3. **User Dashboard**
   - Empty state for new users
   - Invitation card for invited users
   - Sidebar navigation
   - User profile display

4. **Session Management**
   - Protected routes via middleware
   - Persistent sessions
   - Automatic redirect logic

## Development Workflow
1. Always check the technical documentation before implementing features
2. Use TypeScript for all new files
3. Follow the component structure in .cursorrules
4. Test in both light and dark modes
5. Ensure mobile responsiveness
6. Handle loading and error states
7. Use German text for all UI elements

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

## Authentication Flow
1. User clicks "Jetzt voranmelden" → Login page
2. Choose auth method (Social or Email)
3. Email → Magic link sent → Verify email
4. Success → Redirect to dashboard
5. Dashboard shows empty state or invitations

## Important Reminders
- All dates in German format (DD.MM.YYYY)
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