import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

/**
 * Route Handler for OAuth PKCE code exchange
 *
 * This handles the server-side code exchange for OAuth providers (Google, Apple, Azure).
 * The code_verifier is stored in cookies by @supabase/ssr and retrieved here.
 *
 * Magic Links use URL hash (#access_token=...) which can't reach the server,
 * so they are handled by the client-side page at /auth/callback/page.tsx
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'

  console.log('[Auth Callback API] Processing OAuth callback:', {
    hasCode: !!code,
    redirect,
  })

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback API] Error exchanging code:', {
        message: error.message,
        status: error.status,
      })
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    console.log('[Auth Callback API] ✅ Code exchanged successfully')
  }

  // Redirect to dashboard or custom redirect URL
  console.log('[Auth Callback API] Redirecting to:', redirect)
  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}
