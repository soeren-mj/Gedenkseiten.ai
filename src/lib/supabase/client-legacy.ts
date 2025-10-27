import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'

/**
 * Legacy browser client using @supabase/supabase-js directly
 * This is a fallback for React 19 compatibility issues with @supabase/ssr
 *
 * Uses singleton pattern to avoid multiple client instances
 */

let browserClient: SupabaseClient<Database> | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  console.log('[Supabase Client Legacy] Creating legacy client (singleton)')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  browserClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
      },
    }
  )

  console.log('[Supabase Client Legacy] Legacy client created successfully')
  return browserClient
}
