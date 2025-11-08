import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'

/**
 * Legacy browser client using @supabase/supabase-js directly
 * This is a fallback for React 19 compatibility issues with @supabase/ssr
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
        detectSessionInUrl: false, // Only callback route processes URL tokens
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // storageKey removed - using Supabase default: sb-<project-ref>-auth-token
      },
    }
  )

  console.log('[Supabase Client Legacy] Legacy client created successfully')
  return browserClient
}
