# Authentication Troubleshooting Guide

This document contains known authentication issues, their root causes, solutions, and best practices for debugging auth problems in Gedenkseiten.ai.

## Table of Contents
- [Known Issues](#known-issues)
  - [getSession Timeout Error](#getsession-timeout-error)
  - [getSession Timeout with @supabase/ssr (Missing Cookie Handlers)](#getsession-timeout-with-supabasessr-missing-cookie-handlers)
  - [Magic Link Not Working (Implicit vs PKCE Flow)](#magic-link-not-working-implicit-vs-pkce-flow)
  - [Race Conditions in Callback Handler](#race-conditions-in-callback-handler)
  - [Storage Key Mismatch](#storage-key-mismatch)
- [Architecture Overview](#architecture-overview)
- [Best Practices](#best-practices)
- [Debugging Checklist](#debugging-checklist)

---

## Known Issues

### getSession Timeout Error

**Symptom:**
```
[Error] [AuthContext] Error in initAuth:
Error: getSession timeout after 10 seconds
```

**Root Causes:**

1. **Incorrect Storage Key (Primary Issue)**
   - **Location:** `src/lib/supabase/client-legacy.ts:44`
   - **Problem:** Custom `storageKey: 'supabase.auth.token'` doesn't match Supabase's default storage key format
   - **Expected:** `sb-<project-ref>-auth-token`
   - **Impact:** Client can't read session from localStorage, causing `getSession()` to hang indefinitely

2. **detectSessionInUrl Configuration**
   - **Problem:** When set to `true` in both AuthContext and callback handler, both components try to process the same auth code simultaneously
   - **Impact:** Race condition causes one component to hang waiting for URL to change

3. **Singleton Client in Inconsistent State**
   - **Problem:** Legacy client uses singleton pattern, but if first instance is created during callback processing, it may be in transitional state
   - **Impact:** Subsequent calls to `createClient()` return the same potentially broken instance

**Solution:**
✅ **Fixed**
- Removed custom `storageKey` to use Supabase defaults
- Set `detectSessionInUrl: false` in legacy client (only callback processes URLs)
- Hybrid approach: AuthContext without URL detection, Callback with URL detection

**Files Changed:**
- `src/lib/supabase/client-legacy.ts`
- `src/app/auth/callback/page.tsx` (client-side with URL detection)
- `src/contexts/AuthContext.tsx`

---

### getSession Timeout with @supabase/ssr (Missing Cookie Handlers)

**Symptom:**
```
[AuthContext] Initializing auth, getting session...
[AuthContext] Error in initAuth: Error: getSession timeout after 10 seconds
```
- After successful login via API callback, user is redirected back to `/auth/login`
- Server logs show successful code exchange, but client can't read session
- Cookies exist in browser DevTools and are NOT httpOnly

**Root Cause:**

`createBrowserClient` from `@supabase/ssr` without explicit cookie handlers does NOT work reliably, even though the documentation claims it uses `document.cookie` automatically.

**Diagnosis Steps:**

1. Check Browser DevTools → Application → Cookies
2. Verify Supabase cookies exist (e.g., `sb-xxx-auth-token`)
3. Check if HttpOnly column is empty (= NOT httpOnly)
4. If cookies exist and are readable, the problem is missing cookie handlers

**The Problem Chain:**

1. Server-side callback exchanges PKCE code successfully ✅
2. Server sets session cookies (not httpOnly) ✅
3. Browser redirects to `/dashboard` ✅
4. `createBrowserClient` without cookie handlers tries to read cookies
5. Internal cookie handling fails silently
6. `getSession()` hangs → timeout after 10 seconds
7. AuthContext thinks user is not logged in → redirect to `/auth/login`

**Solution:**
✅ **Fixed by adding explicit cookie handlers WITH SSR guards**

```typescript
// src/lib/supabase/client.ts
browserClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll() {
        // SSR Guard - return empty array if not in browser
        if (typeof document === 'undefined') {
          return []
        }
        return document.cookie.split('; ').map(cookie => {
          const [name, ...rest] = cookie.split('=')
          return {
            name: decodeURIComponent(name),
            value: decodeURIComponent(rest.join('='))
          }
        }).filter(c => c.name) // Filter empty entries
      },
      setAll(cookiesToSet) {
        // SSR Guard - skip if not in browser
        if (typeof document === 'undefined') {
          return
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
          if (options?.path) {
            cookieString += `; path=${options.path}`
          } else {
            cookieString += `; path=/`
          }
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }
          if (options?.secure) {
            cookieString += `; secure`
          }
          document.cookie = cookieString
        })
      },
    },
    auth: {
      detectSessionInUrl: false,
    },
  }
)
```

**Why SSR Guards are Required:**

- `typeof document === 'undefined'` checks if code runs in browser
- During SSR/hydration, `document` is not available
- Without guards, the code crashes or behaves unexpectedly
- Guards return empty arrays during SSR, allowing proper hydration

**Why This Works:**

- Explicit cookie handlers ensure reliable cookie reading/writing
- SSR guards prevent crashes during server-side rendering
- Cookies set by server are properly read by browser client
- `getSession()` can now find the session cookies

**Files Changed:**
- `src/lib/supabase/client.ts` - Added explicit cookie handlers with SSR guards

**Related Issue:**
If PKCE code exchange also hangs, the callback page should redirect to the API route:
```typescript
// src/app/auth/callback/page.tsx
if (code) {
  // Redirect to API handler for server-side code exchange
  window.location.href = `/api/auth/callback?code=${code}`
  return
}
```

---

### Magic Link Not Working (Implicit vs PKCE Flow)

**Symptom:**
```
[Auth Callback] Starting auth callback with code: missing
[Auth Callback] No code parameter and no existing session
```
- User clicks magic link
- Redirected to `/auth/callback`
- No session found
- Redirected back to login with error

**Root Cause:**

Magic Links use the **Implicit Flow**, while OAuth uses the **PKCE Flow**. These are incompatible with each other:

1. **Magic Link Flow (Implicit):**
   ```
   User clicks link
   → Supabase /verify endpoint (https://xxx.supabase.co/auth/v1/verify)
   → Supabase sets session tokens in URL fragments (#access_token=XXX)
   → Redirects to callback
   → Client-side JavaScript must process URL fragments
   ```

2. **OAuth Flow (PKCE):**
   ```
   User authenticates with provider
   → Provider redirects with ?code=XXX parameter
   → Callback exchanges code for session
   → Server-side can process query parameters
   ```

**The Problem:**

- **Server-side route handlers** (`route.ts`) can only read **query parameters** (`?code=XXX`) and **cookies**
- **URL fragments** (`#access_token=XXX`) are NOT sent to the server - only available in browser
- Magic Links use fragments, so server-side callback cannot process them
- Result: "No code and no session"

**Why It Worked Before:**

If magic links worked previously, you likely had a **client-side callback page** (`page.tsx`) with `detectSessionInUrl: true`, which can read URL fragments in the browser.

**Solution:**
✅ **Fixed with Hybrid Approach**

Use **client-side callback page** for Magic Links (processes URL fragments):

```typescript
// src/app/auth/callback/page.tsx
'use client'

// Create callback-specific client with URL detection
const supabase = createSupabaseClient(url, key, {
  auth: {
    detectSessionInUrl: true, // CRITICAL for magic links
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Get session - tokens from URL fragments will be processed
const { data: { session } } = await supabase.auth.getSession()
```

**Architecture:**

```
┌─────────────────────────────────────────┐
│ AuthContext (Legacy Client)            │
│ - detectSessionInUrl: false             │
│ - No race conditions                    │
│ - Used throughout app                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Callback Page (Dedicated Client)       │
│ - detectSessionInUrl: true              │
│ - Processes magic link tokens           │
│ - Only used in /auth/callback           │
└─────────────────────────────────────────┘
```

**Why This Works:**

- **AuthContext:** No URL detection = no race conditions
- **Callback Page:** URL detection enabled = can process magic link tokens
- **Separation of concerns:** Each client configured for its specific purpose

**Files Changed:**
- `src/app/auth/callback/page.tsx` (client-side component with dedicated client)
- `src/app/auth/callback/route.ts` (removed - server-side can't process fragments)
- `src/lib/supabase/client-legacy.ts` (detectSessionInUrl: false for AuthContext)

**Alternative Approaches Considered:**

1. **PKCE for Magic Links:** Supabase `signInWithOtp()` fundamentally uses implicit flow, cannot be switched to PKCE
2. **Server-side only:** Cannot work because URL fragments aren't sent to server
3. **detectSessionInUrl everywhere:** Causes race conditions between AuthContext and Callback

---

### Race Conditions in Callback Handler

**Symptom:**
- Inconsistent authentication behavior after clicking magic link
- Sometimes redirects work, sometimes hang
- Multiple "exchanging code for session" logs
- `getSession()` timeouts

**Root Cause:**
Having both AuthContext and Callback trying to process authentication simultaneously with `detectSessionInUrl: true` enabled in both.

**Flow breakdown:**
1. User clicks magic link → redirected to `/auth/callback`
2. Callback component mounts and creates client with `detectSessionInUrl: true`
3. AuthContext also mounts and creates client with `detectSessionInUrl: true`
4. Both try to process URL fragments/tokens simultaneously
5. Race condition: both compete for the same auth state
6. One may succeed, the other times out or hangs

**Solution:**
✅ **Hybrid Approach: Separate Clients with Different Configurations**

**AuthContext (Global Client):**
```typescript
// src/lib/supabase/client-legacy.ts
{
  auth: {
    detectSessionInUrl: false, // ✅ NO URL detection
    persistSession: true,
    autoRefreshToken: true,
  }
}
```

**Callback Page (Dedicated Client):**
```typescript
// src/app/auth/callback/page.tsx
const supabase = createSupabaseClient(url, key, {
  auth: {
    detectSessionInUrl: true, // ✅ URL detection ONLY here
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

**Why This Works:**
- AuthContext never attempts to process URL tokens (no race condition)
- Callback page is the ONLY place that processes auth URLs
- Clear separation of concerns
- Each client optimized for its specific purpose

---

### Storage Key Mismatch

**Symptom:**
- Auth works after login but fails after page reload
- Session not persisted across tabs
- `getSession()` returns null despite recent login

**Root Cause:**
Different components using different storage mechanisms:
- **Middleware:** Uses `@supabase/ssr` with cookie-based storage
- **Client (Legacy):** Uses localStorage with custom key
- **Result:** Session data not shared between server and client

**Solution:**
1. Use Supabase's default storage key (no custom `storageKey`)
2. Ensure middleware and client configurations align
3. Long-term: Migrate fully to `@supabase/ssr` when React 19 compatibility is confirmed

---

## Architecture Overview

### Current Auth Stack (Hybrid Approach)

```
┌─────────────────────────────────────────────┐
│              Next.js App                    │
├─────────────────────────────────────────────┤
│  Server-Side (Middleware)                   │
│  - Uses: @supabase/ssr                      │
│  - Storage: Cookies (HTTP-only)             │
│  - Purpose: Route protection                │
├─────────────────────────────────────────────┤
│  Client-Side (AuthContext)                  │
│  - Uses: @supabase/supabase-js (Legacy)     │
│  - Storage: localStorage                    │
│  - detectSessionInUrl: false ✅             │
│  - Purpose: Global auth state, user data    │
├─────────────────────────────────────────────┤
│  Client-Side (Callback Page)                │
│  - Uses: @supabase/supabase-js (Dedicated)  │
│  - Storage: localStorage                    │
│  - detectSessionInUrl: true ✅              │
│  - Purpose: Process magic link tokens       │
└─────────────────────────────────────────────┘
```

**Key Points:**
- **Two separate Supabase clients** for different purposes
- **AuthContext:** Global client without URL detection (prevents race conditions)
- **Callback Page:** Dedicated client with URL detection (processes magic link tokens)
- **Middleware:** Server-side route protection (unchanged)

### Why Legacy Client?

The legacy client (`client-legacy.ts`) was created as a temporary workaround for React 19 compatibility issues with `@supabase/ssr` package.

**Trade-offs:**
- ✅ Works with React 19
- ❌ Requires manual storage key management
- ❌ Separate from server-side auth (no automatic cookie sync)
- ❌ Singleton pattern can mask errors

**Future:** Migrate back to `@supabase/ssr` when React 19 support is stable.

---

## Best Practices

### Configuration

**DO:**
```typescript
// In client-legacy.ts
{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Only callback should process URLs
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Don't set custom storageKey - use Supabase defaults
  }
}
```

**DON'T:**
```typescript
{
  auth: {
    detectSessionInUrl: true, // ❌ Causes race conditions
    storageKey: 'supabase.auth.token', // ❌ Breaks session retrieval
  }
}
```

### Callback Handling

**DO:** Use Client-Side Page with Dedicated Client (For Magic Links)
```typescript
// src/app/auth/callback/page.tsx
'use client'

export default function AuthCallbackPage() {
  useEffect(() => {
    // Create DEDICATED client with URL detection for this page only
    const supabase = createSupabaseClient(url, key, {
      auth: {
        detectSessionInUrl: true, // ✅ Only enabled here
        persistSession: true,
        autoRefreshToken: true,
      }
    })

    // Process magic link tokens from URL
    const { data: { session } } = await supabase.auth.getSession()
    if (session) router.push('/dashboard')
  }, [])
}
```

**DON'T:** Enable URL Detection in Global Client
```typescript
// ❌ Creates race conditions with Callback page
// src/lib/supabase/client-legacy.ts
{
  auth: {
    detectSessionInUrl: true, // ❌ BAD: Both AuthContext and Callback process URLs
  }
}
```

### Error Handling

**DO:** Log with context and severity
```typescript
console.warn('[AuthContext] ⚠️ Invitation fetch exception:', {
  error: invitationError,
  note: 'Expected during initial setup if table does not exist'
})
```

**DON'T:** Silently swallow errors
```typescript
// ❌ Makes debugging impossible
try {
  await fetchData()
} catch (e) {
  // Silent fail
}
```

### Singleton Client

The legacy client uses singleton pattern. Be aware:

```typescript
// All calls return THE SAME instance
const client1 = createClient()
const client2 = createClient()
console.log(client1 === client2) // true
```

**Implications:**
- Comments like "create fresh client" are misleading
- Client state persists across all components
- Cannot recreate client without page reload
- If singleton is broken, entire app is affected

---

## Debugging Checklist

### Magic Link Not Working

1. **Check Supabase Dashboard:**
   - Email delivery settings configured?
   - Template using correct redirect URL?
   - Rate limits not exceeded?

2. **Check Console Logs:**
   ```
   [Auth Callback] Starting auth callback with code: present/missing
   [Auth Callback] Supabase client created, exchanging code for session...
   [Auth Callback] ✅ Session exchange successful
   ```

3. **Check Network Tab:**
   - POST to `/auth/v1/token?grant_type=pkce` succeeds?
   - Cookies being set in response?
   - Redirects happening correctly?

4. **Check localStorage:**
   ```javascript
   // In browser console
   Object.keys(localStorage).filter(k => k.includes('supabase'))
   // Should show: sb-<project-ref>-auth-token
   ```

### Session Not Persisting

1. **Check Storage Key:**
   - No custom `storageKey` in `client-legacy.ts`?
   - localStorage key matches Supabase format?

2. **Check Cookie Settings:**
   - Middleware setting cookies correctly?
   - Cookies not being blocked by browser?
   - Domain/path settings correct for environment?

3. **Check Auth State:**
   ```typescript
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session) // Should not be null
   ```

### getSession Hanging

1. **Check Configuration:**
   - `detectSessionInUrl: false` in legacy client?
   - No custom `storageKey` set?

2. **Check for Race Conditions:**
   - Only server route handling callbacks?
   - No client-side `page.tsx` in callback folder?

3. **Add Timeout Debug:**
   ```typescript
   const sessionPromise = supabase.auth.getSession()
   const timeoutPromise = new Promise((_, reject) => {
     setTimeout(() => reject(new Error('Timeout')), 5000)
   })

   try {
     const result = await Promise.race([sessionPromise, timeoutPromise])
     console.log('Session retrieved:', result)
   } catch (e) {
     console.error('getSession timed out - check storage key and network')
   }
   ```

### AuthContext Not Loading User

1. **Check Database:**
   - `users` table exists?
   - User row created after authentication?
   - RLS policies allowing read?

2. **Check Console Logs:**
   ```
   [AuthContext] Initializing auth, getting session...
   [AuthContext] Initial session found for user: <email>
   [AuthContext] Fetching user profile for: <userId>
   [AuthContext] ✅ User profile found in database
   ```

3. **Check Profile Creation:**
   - If table missing, AuthContext creates minimal user object
   - Check for error code `42P01` (table doesn't exist)
   - Check for error code `PGRST116` (no rows found)

---

## Configuration Reference

### Current Settings (After Fixes)

**`src/lib/supabase/client-legacy.ts` (Global Client):**
```typescript
{
  auth: {
    autoRefreshToken: true,        // ✅ Auto-refresh access tokens
    persistSession: true,           // ✅ Save session to localStorage
    detectSessionInUrl: false,      // ✅ NO URL detection (prevents race conditions)
    storage: window.localStorage,   // ✅ Browser storage
    // storageKey NOT SET             ✅ Use Supabase default
  }
}
```

**`src/app/auth/callback/page.tsx` (Callback-Specific Client):**
```typescript
// Client-side component
const supabase = createSupabaseClient(url, key, {
  auth: {
    detectSessionInUrl: true,       // ✅ URL detection ONLY here
    persistSession: true,
    autoRefreshToken: true,
  }
})
```
- Processes magic link tokens from URL fragments
- Creates dedicated client (separate from global client)
- Redirects to dashboard on success

**`src/contexts/AuthContext.tsx`:**
- Uses global singleton client from `client-legacy.ts`
- Listens for auth state changes
- Fetches user profile from database
- Handles invitations
- NO URL detection (avoids race conditions with callback)

---

## Related Files

- `src/lib/supabase/client-legacy.ts` - Legacy browser client (global, no URL detection)
- `src/lib/supabase/server.ts` - Server-side client factory
- `src/lib/supabase/middleware.ts` - Middleware auth helpers
- `src/app/auth/callback/page.tsx` - Client-side callback handler (dedicated client with URL detection)
- `src/app/auth/login/page.tsx` - Login page (magic link only, no OAuth)
- `src/contexts/AuthContext.tsx` - Client-side auth context (uses global client)
- `middleware.ts` - Next.js middleware for route protection

---

## Future Improvements

1. **Migrate to @supabase/ssr:**
   - Check if latest version supports React 19
   - Remove legacy client entirely
   - Unified cookie-based storage across server/client

2. **Add Client-Level Timeouts:**
   - Configure fetch timeout in Supabase client
   - Use AbortSignal for network requests
   - Graceful degradation on timeout

3. **Enhanced Error Tracking:**
   - Integrate error monitoring (Sentry, etc.)
   - Track auth flow analytics
   - Measure success/failure rates

4. **Session Refresh Improvements:**
   - Proactive token refresh before expiry
   - Better handling of refresh failures
   - User-friendly session expiry messaging

---

## Getting Help

If you encounter an auth issue not covered here:

1. **Check Console Logs:**
   - Look for `[Auth*]` or `[Supabase*]` prefixed logs
   - Note the exact error message and stack trace

2. **Check Browser DevTools:**
   - Network tab: Failed requests?
   - Application tab: localStorage and cookies set correctly?
   - Console: Any uncaught errors?

3. **Document the Issue:**
   - What were you trying to do?
   - What happened instead?
   - Steps to reproduce
   - Console logs and errors

4. **Add to This File:**
   - Once resolved, document the problem and solution here
   - Help future developers avoid the same issue

---

**Last Updated:** 2026-01-03
**Maintainer:** Development Team
