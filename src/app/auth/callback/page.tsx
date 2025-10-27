'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-legacy'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const next = searchParams.get('next') ?? '/dashboard'

        if (!code) {
          // No code means user navigated here directly
          // Check if they already have a session
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (session) {
            // Already logged in, redirect to dashboard
            console.log('[Auth Callback Page] No code but session exists, redirecting to dashboard')
            router.push('/dashboard')
          } else {
            // No session and no code, redirect to login
            console.log('[Auth Callback Page] No code parameter, redirecting to login')
            router.push('/auth/login')
          }
          return
        }

        console.log('[Auth Callback Page] Starting auth callback with code')

        const supabase = createClient()
        console.log('[Auth Callback Page] Supabase client created, exchanging code for session...')

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('[Auth Callback Page] Error exchanging code for session:', {
            message: error.message,
            status: error.status,
            name: error.name,
          })
          setError(error.message)
          router.push(`/auth/login?error=exchange_failed&details=${encodeURIComponent(error.message)}`)
          return
        }

        if (!data.session) {
          console.error('[Auth Callback Page] No session returned after exchange')
          router.push('/auth/login?error=no_session')
          return
        }

        if (!data.user) {
          console.error('[Auth Callback Page] No user returned after exchange')
          router.push('/auth/login?error=no_user')
          return
        }

        console.log('[Auth Callback Page] ✅ Session exchange successful:', {
          userId: data.user.id,
          userEmail: data.user.email,
          sessionExists: !!data.session,
        })

        // Redirect to next page
        console.log('[Auth Callback Page] Redirecting to:', next)
        router.push(next)
      } catch (exception) {
        console.error('[Auth Callback Page] Unexpected exception:', exception)
        setError(String(exception))
        router.push(`/auth/login?error=exception&details=${encodeURIComponent(String(exception))}`)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-section-h2 text-primary mb-4">
          {error ? 'Fehler bei der Anmeldung' : 'Anmeldung wird verarbeitet...'}
        </h1>
        {error ? (
          <p className="text-body-m text-error-message">{error}</p>
        ) : (
          <p className="text-body-m text-secondary">Bitte warten Sie einen Moment.</p>
        )}
      </div>
    </div>
  )
}
