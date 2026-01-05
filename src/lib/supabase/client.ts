import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../supabase'

/**
 * Browser Supabase client using @supabase/ssr
 *
 * Uses singleton pattern to avoid multiple client instances
 *
 * IMPORTANT: This client uses cookies (not localStorage) to store the session.
 * This ensures the session is shared between client and server components.
 *
 * @supabase/ssr automatically handles:
 * - Cookie-based session storage
 * - Session synchronization with server
 * - Token refresh
 */

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  console.log('[Supabase Client] Creating browser client (singleton)')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables')
  }

  // Explicit cookie handlers WITH SSR guards
  // @supabase/ssr's automatic handling doesn't work reliably without these
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
        // CRITICAL: Disable URL detection in global client to prevent race conditions
        // The callback page (/auth/callback) handles URL tokens manually
        // See docs/auth-troubleshooting.md for details
        detectSessionInUrl: false,
      },
    }
  )

  console.log('[Supabase Client] Browser client created successfully')
  return browserClient
}
