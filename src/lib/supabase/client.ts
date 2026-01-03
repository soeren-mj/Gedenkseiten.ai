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

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('[Supabase Client] Browser client created successfully')
  return browserClient
}
