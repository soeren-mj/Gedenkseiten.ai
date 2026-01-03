'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Auth Callback Page - Handles Magic Links and Email Change
 *
 * This page handles:
 * 1. Magic Link tokens (#access_token=...&refresh_token=...)
 * 2. Email change confirmations (?flow=email_change)
 *
 * OAuth PKCE (?code=...) is handled by the Route Handler at /api/auth/callback/route.ts
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Auth Callback Page] Starting callback processing...')

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const flow = urlParams.get('flow') || hashParams.get('flow')

        console.log('[Auth Callback Page] URL parameters:', {
          search: window.location.search,
          hash: window.location.hash,
          flow,
        })

        // ============================================
        // EMAIL CHANGE FLOW
        // ============================================
        if (flow === 'email_change') {
          console.log('[Auth Callback Page] ✅ Detected email change confirmation')
          await handleEmailChange(hashParams, urlParams)
          return
        }

        // ============================================
        // MAGIC LINK FLOW (tokens in hash)
        // ============================================
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        console.log('[Auth Callback Page] Token check:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        })

        if (accessToken && refreshToken) {
          console.log('[Auth Callback Page] Processing magic link tokens...')

          const supabase = createClient()
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('[Auth Callback Page] Session error:', sessionError)
            setError(sessionError.message)
            router.push(`/auth/login?error=${encodeURIComponent(sessionError.message)}`)
            return
          }

          console.log('[Auth Callback Page] ✅ Session established from magic link')

          // Check for redirect parameter
          const redirectUrl = urlParams.get('redirect')
          if (redirectUrl && redirectUrl.startsWith('/')) {
            console.log('[Auth Callback Page] Redirecting to:', redirectUrl)
            router.push(redirectUrl)
          } else {
            console.log('[Auth Callback Page] Redirecting to dashboard')
            router.push('/dashboard')
          }
          return
        }

        // ============================================
        // FALLBACK: Check existing session
        // ============================================
        // This handles cases where:
        // - User was already logged in
        // - OAuth completed via Route Handler and redirected here
        console.log('[Auth Callback Page] No tokens in URL, checking existing session...')

        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          console.log('[Auth Callback Page] ✅ Existing session found:', session.user.email)
          const redirectUrl = urlParams.get('redirect')
          if (redirectUrl && redirectUrl.startsWith('/')) {
            router.push(redirectUrl)
          } else {
            router.push('/dashboard')
          }
        } else {
          console.error('[Auth Callback Page] No session found')
          setError('Keine gültige Sitzung gefunden')
          router.push('/auth/login?error=no_session')
        }
      } catch (exception) {
        console.error('[Auth Callback Page] Unexpected exception:', exception)
        setError(String(exception))
        router.push(`/auth/login?error=exception&details=${encodeURIComponent(String(exception))}`)
      }
    }

    // Email change handler (extracted for clarity)
    const handleEmailChange = async (
      hashParams: URLSearchParams,
      urlParams: URLSearchParams
    ) => {
      const supabaseClient = createClient()

      // Check for errors in URL hash
      const error = hashParams.get('error')
      const error_code = hashParams.get('error_code')
      const error_description = hashParams.get('error_description')

      if (error) {
        console.error('[Auth Callback Page] ❌ Email change error from Supabase:', {
          error,
          error_code,
          error_description,
        })

        let errorMessage = 'Email-Änderung fehlgeschlagen'

        if (error_code === 'otp_expired') {
          errorMessage = 'Der Email-Link ist abgelaufen. Bitte fordere eine neue Email-Änderung an.'
        } else if (error_code === 'otp_disabled') {
          errorMessage = 'Der Email-Link wurde bereits verwendet oder ist ungültig.'
        } else if (error === 'access_denied') {
          errorMessage = 'Zugriff verweigert. Der Link ist ungültig oder wurde bereits verwendet.'
        } else if (error_description) {
          errorMessage = decodeURIComponent(error_description.replace(/\+/g, ' '))
        }

        setError(errorMessage)
        router.push(`/dashboard/settings?error=${encodeURIComponent(errorMessage)}`)
        return
      }

      // Extract token from URL
      const token_hash =
        hashParams.get('token_hash') ||
        hashParams.get('access_token') ||
        urlParams.get('token')

      console.log('[Auth Callback Page] Token extraction:', {
        hasTokenHash: !!hashParams.get('token_hash'),
        hasAccessToken: !!hashParams.get('access_token'),
        hasQueryToken: !!urlParams.get('token'),
        finalToken: token_hash ? 'found' : 'not found',
      })

      if (!token_hash) {
        console.error('[Auth Callback Page] ❌ No token found for email change')
        setError('Ungültiger Bestätigungslink')
        router.push('/auth/login?error=invalid_token')
        return
      }

      console.log('[Auth Callback Page] Processing email change...')

      let user = null

      if (hashParams.get('access_token')) {
        // Session-based flow
        console.log('[Auth Callback Page] Using session-based email change flow')

        const refresh_token = hashParams.get('refresh_token') || ''

        const { error: sessionError } = await supabaseClient.auth.setSession({
          access_token: token_hash,
          refresh_token: refresh_token,
        })

        if (sessionError) {
          console.error('[Auth Callback Page] ❌ Failed to set session:', sessionError)
          setError('Session-Fehler: ' + sessionError.message)
          router.push(`/dashboard/settings?error=${encodeURIComponent(sessionError.message)}`)
          return
        }

        const { data: userData, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !userData.user) {
          console.error('[Auth Callback Page] ❌ Failed to get user:', userError)
          setError('Benutzer konnte nicht geladen werden')
          router.push('/dashboard/settings?error=user_load_failed')
          return
        }

        user = userData.user
        console.log('[Auth Callback Page] ✅ Session established, user:', user.email)
      } else {
        // Legacy verifyOtp flow
        console.log('[Auth Callback Page] Using legacy verifyOtp flow')

        const { data, error: verifyError } = await supabaseClient.auth.verifyOtp({
          token_hash,
          type: 'email_change',
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
        console.log('[Auth Callback Page] Syncing email to public.users...')

        const { data: updateResult, error: syncError } = await supabaseClient
          .from('users')
          .update({
            email: user.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()

        if (syncError) {
          console.error('[Auth Callback Page] ❌ Failed to sync email:', syncError)
          setError('Email wurde geändert, aber Profil-Synchronisation fehlgeschlagen.')
          router.push(`/dashboard/settings?email_changed=true&sync_error=true&new_email=${encodeURIComponent(user.email)}`)
          return
        }

        if (!updateResult || updateResult.length === 0) {
          console.warn('[Auth Callback Page] ⚠️ Email update returned no rows')
        } else {
          console.log('[Auth Callback Page] ✅ Email synced to public.users')
        }

        router.push(`/dashboard/settings?email_changed=true&new_email=${encodeURIComponent(user.email)}`)
      } else {
        console.error('[Auth Callback Page] ❌ No email in verified user data')
        setError('Email-Adresse nicht gefunden')
        router.push('/auth/login?error=no_email')
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
