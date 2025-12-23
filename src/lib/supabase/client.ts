import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'

/**
 * Browser Supabase client using @supabase/supabase-js directly
 * (Required for React 19 compatibility - @supabase/ssr has issues)
 *
 * Uses singleton pattern to avoid multiple client instances
 *
 * IMPORTANT CONFIGURATION NOTES:
 * - detectSessionInUrl: false - Only the callback route should process URL tokens
 *   Setting this to true causes race conditions between AuthContext and callback handler
 * - storageKey: Use Supabase default (sb-<project-ref>-auth-token) instead of custom key
 *   Custom keys break session retrieval and cause getSession() to hang
 */

let browserClient: SupabaseClient<Database> | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  console.log('[Supabase Client] Creating browser client (singleton)')

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
        detectSessionInUrl: false, // Only callback route processes URL tokens
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // storageKey removed - using Supabase default: sb-<project-ref>-auth-token
      },
    }
  )

  console.log('[Supabase Client] Browser client created successfully')
  return browserClient
}
