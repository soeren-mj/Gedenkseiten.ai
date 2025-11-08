'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-legacy'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/text-input'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Divider } from '@/components/ui/divider'
import ChangeIcon from '@/components/icons/ChangeIcon'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleEmailSignIn = async () => {
    if (!email) {
      setError('Bitte geben Sie eine E-Mail-Adresse ein.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if user exists using our API
      const response = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      // For privacy, we always send magic link regardless of user existence
      // But we can show password form if user exists and has password
      if (data.userExists && data.authMethods.includes('password')) {
        // Show password form for existing users with password
        setShowPasswordForm(true)
        setShowEmailForm(false)
      } else {
        // Send magic link for new users or users without password
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          setError('Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.')
          return
        }

        setEmailSent(true)
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSignIn = async () => {
    if (!email || !password) {
      setError('Bitte füllen Sie alle Felder aus.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Ungültige E-Mail oder Passwort.')
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMagicLink = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError('Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut.')
        return
      }

      setEmailSent(true)
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToOptions = () => {
    setShowEmailForm(false)
    setShowPasswordForm(false)
    setEmail('')
    setPassword('')
    setError(null)
    setEmailSent(false)
  }

  // Check for auth errors from callback
  const authError = searchParams.get('error')

  // Success state after email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-primary flex flex-col">
        {/* Simple Navbar */}
        <nav className="w-full">
          <div className="max-w-[1820px] mx-auto px-5 md:px-8 lg:px-[60px]">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center space-x-1">
                <Image
                  src="/images/logo-gedenkseiten.ai-white-x4.png"
                  alt="Gedenkseiten.ai"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="font-satoshi text-xl font-medium">
                  Gedenkseiten.ai
                </span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-[611px] p-3 backdrop-blur-xl rounded-lg"
               style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
              >
            <div className="rounded-sm bg-primary p-3 flex flex-col items-center justify-center gap-6">
              <div className="flex flex-col gap-2 mt-2">
                {/* Success Icon */}
               <div className="w-10 h-10 bg-interactive-positive-default rounded-full flex items-center justify-center mx-auto">
                 <svg className="w-8 h-8 text-interactive-positive-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h1 className="text-subsection-h3 text-primary">
                Magic Link verschickt!
               </h1>
              </div>
              <p className="text-body-m text-secondary text-center">
                ✉️ Wir haben dir eine E-Mail an <strong>{email}</strong> geschickt. 
                Bitte überprüfe dein Postfach und klicke auf den Link.
              </p>
               {/* Button Container */}
               <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={handleBackToOptions}
                >
                  Andere E-Mail verwenden
                </Button>

                <Button
                  variant="tertiary"
                  size="sm"
                  fullWidth
                  onClick={() => router.push('/')}
                >
                  Zurück zur Startseite
                </Button>
              </div>

              <div className="mt-6 p-4 bg-secondary rounded-xs">
                <p className="text-body-xs text-tertiary">
                  <strong>Hinweis:</strong> Der Link ist 1 Stunde gültig. 
                  Überprüfen Sie auch Ihren Spam-Ordner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Simple Navbar */}
      <nav className="w-full">
        <div className="max-w-[1820px] mx-auto px-5 md:px-8 lg:px-[60px]">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-1">
              <Image
                src="/images/logo-gedenkseiten.ai-white-x4.png"
                alt="Gedenkseiten.ai"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="font-satoshi text-xl font-medium">
                Gedenkseiten.ai
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[685px]">
          <div className="flex flex-col justify-center items-center px-5 pt-10 pb-5 gap-8">
            {/* Header */}
            <div className="flex flex-col text-center gap-3">
              <h1 className="text-section-h2 text-primary">
                Deine Wahl.
              </h1>
              <p className="text-body-l text-secondary">
                Erstelle dein persönliches Gedenkseiten.ai Konto oder logge dich ein.
              </p>
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="mb-6 p-4 bg-error-message border border-message-error rounded-xs">
                <p className="text-body-s text-message-error">
                  {error || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'}
                </p>
              </div>
            )}

            {showPasswordForm ? (
              // Password Form State (Existing User)
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <h2 className="text-title-body-h4 text-primary mb-2">
                    Willkommen zurück!
                  </h2>
                  <p className="text-body-s text-secondary">
                    {email}
                  </p>
                </div>

                <div className="w-full">
                  <label htmlFor="password" className="block text-body-s-semibold text-primary mb-2">
                    Passwort
                  </label>
                  <TextInput
                    id="password"
                    type="password"
                    size="md"
                    value={password}
                    onChange={setPassword}
                    placeholder="Passwort eingeben"
                    disabled={loading}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handlePasswordSignIn}
                  loading={loading}
                  disabled={!password.trim()}
                >
                  Anmelden
                </Button>

                <div className="text-center text-body-s text-secondary">
                  oder
                </div>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleSendMagicLink}
                  loading={loading}
                >
                  Magic Link senden
                </Button>

                <button
                  onClick={handleBackToOptions}
                  className="text-body-s text-interactive-link-default hover:text-interactive-link-hover underline"
                  disabled={loading}
                >
                  Andere E-Mail verwenden
                </button>
              </div>
            ) : showEmailForm ? (
              // Email Form State
              <div className="flex flex-col items-center justify-center gap-7 min-w-[320px]">
                <div className="w-full flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="block px-1 text-body-s-semibold text-primary">
                    E-Mail
                  </label>
                  <TextInput
                    id="email"
                    type="email"
                    size="md"
                    value={email}
                    onChange={setEmail}
                    placeholder="z.B. max.mustermann@example.de"
                    showClearButton
                    disabled={loading}
                    onClear={() => setEmail('')}
                  />
                  </div>
                  <Button
                  variant="primary"
                  size="md"
                  onClick={handleEmailSignIn}
                  loading={loading}
                  disabled={!email.trim()}
                  className="w-full"
                >
                  Weiter
                </Button>
                </div>

                

                {/* Divider */}
                <Divider />

                {/* Back Link */}
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={handleBackToOptions}
                  disabled={loading}
                  leftIcon={<ChangeIcon />}
                  className="w-full"
                >
                  Eine andere Variante nutzen...
                </Button>
              </div>
            ) : (
              // Default State - Auth Options
              <>
                {/* Auth Options */}
                <div className="flex flex-col justify-center gap-7 min-w-[320px] my-4">
                  {/* Passkey - Coming Soon */}
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    disabled={true}
                    leftIcon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.65 10A5.99 5.99 0 0 0 7 4a6 6 0 0 0-6 6c0 1.54.58 2.94 1.53 4A5.98 5.98 0 0 0 7 16a5.99 5.99 0 0 0 5.65-4H17l2 2 2-2 2 2 1.5-1.5L21 9h-8.35zM7 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                      </svg>
                    }
                  >
                    Mit Passkey fortfahren
                  </Button>

                  {/* Email Option */}
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => setShowEmailForm(true)}
                    disabled={loading}
                    leftIcon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 6l-10 7L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  >
                    Mit E-Mail-Adresse fortfahren
                  </Button>
                </div>
                
              </>
            )}

            {/* Legal Text - Always shown */}
            {!showEmailForm && (
              <div className="text-center">
                <p className="text-body-xs text-tertiary">
                  Dein Name und dein Foto können anderen Benutzenden angezeigt werden, wenn du mit Gedenkseiten
                  interagierst und dich andere Personen mit deiner E-Mail-Adresse einladen wollen. Indem du fortfährst,
                  erklärst du, dass du unsere{' '}
                  <Link 
                    href="/agb" 
                    className="text-interactive-link-default hover:text-interactive-link-hover underline"
                  >
                    Allgemeinen Geschäftsbedingungen
                  </Link>{' '}
                  und die{' '}
                  <Link 
                    href="/datenschutz" 
                    className="text-interactive-link-default hover:text-interactive-link-hover underline"
                  >
                    Datenschutzrichtlinie
                  </Link>{' '}
                  verstehst und akzeptierst.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}