import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../supabase'

export function createClient() {
  console.log('[Supabase Client] Creating browser client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_URL')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  try {
    const client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    console.log('[Supabase Client] Browser client created successfully')
    return client
  } catch (error) {
    console.error('[Supabase Client] Error creating browser client:', error)
    throw error
  }
}