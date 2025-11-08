'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client-legacy'
import type { Database } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Auth Callback Page] Starting callback processing...')

        // Check if this is an email change confirmation
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = urlParams.get('type') || hashParams.get('type')
        const flow = urlParams.get('flow') || hashParams.get('flow')

        // Debug logging
        console.log('[Auth Callback Page] URL parameters:', {
          search: window.location.search,
          hash: window.location.hash,
          type,
          flow,
        })

        // Email change detection:
        // 1. Custom flow parameter (set by our emailRedirectTo)
        // 2. Fallback: type=email AND user already confirmed (not a signup)
        const isEmailChange = flow === 'email_change'

        if (isEmailChange) {
          console.log('[Auth Callback Page] ✅ Detected email change confirmation (flow parameter)')
        }

        // ============================================
        // SEPARATE FLOW FOR EMAIL CHANGE
        // ============================================
        // For email change, user is ALREADY logged in. We use the legacy client
        // to avoid creating a second client that would conflict with the existing session.
        if (isEmailChange) {
          console.log('[Auth Callback Page] Using email change flow with legacy client...')

          const legacyClient = createClient()

          // FIRST: Check for errors in URL hash (Supabase sends errors here)
          const error = hashParams.get('error')
          const error_code = hashParams.get('error_code')
          const error_description = hashParams.get('error_description')

          if (error) {
            console.error('[Auth Callback Page] ❌ Email change error from Supabase:', {
              error,
              error_code,
              error_description
            })

            // Show specific error message based on error_code
            let errorMessage = 'Email-Änderung fehlgeschlagen'

            if (error_code === 'otp_expired') {
              errorMessage = 'Der Email-Link ist abgelaufen. Bitte fordere eine neue Email-Änderung an.'
            } else if (error_code === 'otp_disabled') {
              errorMessage = 'Der Email-Link wurde bereits verwendet oder ist ungültig.'
            } else if (error === 'access_denied') {
              errorMessage = 'Zugriff verweigert. Der Link ist ungültig oder wurde bereits verwendet.'
            } else if (error_description) {
              // Use Supabase's error description if available
              errorMessage = decodeURIComponent(error_description.replace(/\+/g, ' '))
            }

            setError(errorMessage)
            router.push(`/dashboard/settings?error=${encodeURIComponent(errorMessage)}`)
            return
          }

          // THEN: Extract token from URL (check multiple possible locations)
          // Supabase can send tokens in different formats:
          // - Query string: ?token=...
          // - Hash: #token_hash=...
          // - Hash (email_change): #access_token=...
          const token_hash =
            hashParams.get('token_hash') ||
            hashParams.get('access_token') ||
            urlParams.get('token')

          console.log('[Auth Callback Page] Token extraction:', {
            hasTokenHash: !!hashParams.get('token_hash'),
            hasAccessToken: !!hashParams.get('access_token'),
            hasQueryToken: !!urlParams.get('token'),
            finalToken: token_hash ? 'found' : 'not found'
          })

          if (!token_hash) {
            console.error('[Auth Callback Page] ❌ No token found in URL for email change')
            console.error('[Auth Callback Page] Available params:', {
              hashKeys: Array.from(hashParams.keys()),
              queryKeys: Array.from(urlParams.keys())
            })
            setError('Ungültiger Bestätigungslink')
            router.push('/auth/login?error=invalid_token')
            return
          }

          console.log('[Auth Callback Page] Processing email change...')

          // Supabase sends email change confirmations in two possible formats:
          // 1. Modern: access_token in hash (session-based)
          // 2. Legacy: token for verifyOtp

          let user = null

          if (hashParams.get('access_token')) {
            // Modern flow: Use session with access_token
            console.log('[Auth Callback Page] Using session-based email change flow (access_token present)')

            const refresh_token = hashParams.get('refresh_token') || ''

            // Set session with the tokens from URL
            const { error: sessionError } = await legacyClient.auth.setSession({
              access_token: token_hash,
              refresh_token: refresh_token
            })

            if (sessionError) {
              console.error('[Auth Callback Page] ❌ Failed to set session:', sessionError)
              setError('Session-Fehler: ' + sessionError.message)
              router.push(`/dashboard/settings?error=${encodeURIComponent(sessionError.message)}`)
              return
            }

            // Get user from the session
            const { data: userData, error: userError } = await legacyClient.auth.getUser()

            if (userError || !userData.user) {
              console.error('[Auth Callback Page] ❌ Failed to get user from session:', userError)
              setError('Benutzer konnte nicht geladen werden')
              router.push('/dashboard/settings?error=user_load_failed')
              return
            }

            user = userData.user
            console.log('[Auth Callback Page] ✅ Session established, user:', user.email)

          } else {
            // Legacy flow: Use verifyOtp
            console.log('[Auth Callback Page] Using legacy verifyOtp flow')

            const { data, error: verifyError } = await legacyClient.auth.verifyOtp({
              token_hash,
              type: 'email_change' as any
            })

            if (verifyError || !data.user) {
              console.error('[Auth Callback Page] ❌ Email change verification failed:', verifyError)
              setError(verifyError?.message || 'Email-Bestätigung fehlgeschlagen')
              router.push(`/auth/login?error=${encodeURIComponent(verifyError?.message || 'verification_failed')}`)
              return
            }

            user = data.user
            console.log('[Auth Callback Page] ✅ Email change verified (legacy), new email:', user.email)
          }

          console.log('[Auth Callback Page] ✅ Email change confirmed, new email:', user.email)

          // Sync email to public.users table
          if (user.email) {
            console.log('[Auth Callback Page] Syncing email to public.users...', {
              userId: user.id,
              newEmail: user.email
            })

            const { data: updateResult, error: syncError } = await legacyClient
              .from('users')
              .update({
                email: user.email,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
              .select()

            if (syncError) {
              console.error('[Auth Callback Page] ❌ CRITICAL: Failed to sync email to public.users:', {
                message: syncError.message,
                code: syncError.code,
                details: syncError.details,
                hint: syncError.hint,
                userId: user.id,
                newEmail: user.email
              })

              // Show warning to user but continue (email is changed in auth.users)
              setError('Email wurde geändert, aber Profil-Synchronisation fehlgeschlagen. Bitte kontaktiere den Support.')
              router.push(`/dashboard/settings?email_changed=true&sync_error=true&new_email=${encodeURIComponent(user.email)}`)
              return
            }

            if (!updateResult || updateResult.length === 0) {
              console.warn('[Auth Callback Page] ⚠️ Email update returned no rows - profile may not exist in public.users')
              console.log('[Auth Callback Page] User will need to re-login to create profile')
            } else {
              console.log('[Auth Callback Page] ✅ Email synced successfully to public.users:', updateResult[0])
            }

            console.log('[Auth Callback Page] Redirecting to settings with success flag...')
            router.push(`/dashboard/settings?email_changed=true&new_email=${encodeURIComponent(user.email)}`)
            return
          } else {
            console.error('[Auth Callback Page] ❌ No email in verified user data')
            setError('Email-Adresse nicht gefunden')
            router.push('/auth/login?error=no_email')
            return
          }
        }

        // ============================================
        // REGULAR AUTH FLOW (Magic Link, OAuth)
        // ============================================
        // For regular auth, create a new client with URL detection enabled
        console.log('[Auth Callback Page] Using regular auth flow...')

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase environment variables')
        }

        const supabase = createSupabaseClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true, // CRITICAL: Enables magic link token processing
              storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            },
          }
        )

        console.log('[Auth Callback Page] Callback client created, checking session...')

        // Get session - if magic link was clicked, the token will be in URL and processed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[Auth Callback Page] Session error:', sessionError)
          setError(sessionError.message)
          router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`)
          return
        }

        if (session) {
          console.log('[Auth Callback Page] ✅ Session found:', {
            userId: session.user.id,
            userEmail: session.user.email,
            emailConfirmedAt: session.user.email_confirmed_at,
          })

          // Note: Profile creation is handled by AuthContext with retry logic
          // AuthContext will be triggered by the SIGNED_IN event and will:
          // 1. Check if profile exists in public.users
          // 2. Create profile if needed with 3 retries
          // 3. Handle race conditions and conflicts gracefully
          console.log('[Auth Callback Page] Profile will be synced by AuthContext')

          // Regular login - redirect to dashboard
          console.log('[Auth Callback Page] Regular auth callback, redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.error('[Auth Callback Page] No session found after token processing')
          setError('Keine gültige Sitzung gefunden')
          router.push('/auth/login?error=no_session')
        }
      } catch (exception) {
        console.error('[Auth Callback Page] Unexpected exception:', exception)
        setError(String(exception))
        router.push(`/auth/login?error=exception&details=${encodeURIComponent(String(exception))}`)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-section-h2 text-primary mb-4">
          {error ? 'Fehler bei der Anmeldung' : 'Anmeldung wird verarbeitet...'}
        </h1>
        {error ? (
          <p className="text-body-m text-message-error">{error}</p>
        ) : (
          <p className="text-body-m text-secondary">Bitte warten Sie einen Moment.</p>
        )}
      </div>
    </div>
  )
}
