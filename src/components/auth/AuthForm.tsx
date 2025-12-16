'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-legacy';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/text-input';
import Link from 'next/link';
import { Divider } from '@/components/ui/divider';
import ChangeIcon from '@/components/icons/ChangeIcon';

interface AuthFormProps {
  redirectUrl?: string;
  onSuccess?: () => void;
  showLegalText?: boolean;
  compact?: boolean;
}

/**
 * AuthForm - Reusable authentication form component
 *
 * Used in:
 * - LoginModal (compact mode)
 * - /auth/login page (full mode)
 *
 * Supports:
 * - Google OAuth
 * - Passkey (disabled, coming soon)
 * - Email with Magic Link
 * - Password login (for existing users)
 */
export default function AuthForm({
  redirectUrl,
  onSuccess,
  showLegalText = true,
  compact = false,
}: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleOAuthSignIn = async (provider: 'google' | 'apple' | 'azure') => {
    try {
      setLoading(true);
      setError(null);

      const callbackUrl = redirectUrl
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email) {
      setError('Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user exists using our API
      const response = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Show password form if user exists and has password
      if (data.userExists && data.authMethods.includes('password')) {
        setShowPasswordForm(true);
        setShowEmailForm(false);
      } else {
        // Send magic link for new users or users without password
        // Use current pathname as fallback (fixes SSR issue where redirectUrl prop is undefined)
        const finalRedirectUrl = redirectUrl ||
          (window.location.pathname !== '/auth/login' ? window.location.pathname : undefined);

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: finalRedirectUrl
              ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(finalRedirectUrl)}`
              : `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setError('Fehler beim Senden der E-Mail. Bitte versuche es erneut.');
          return;
        }

        setEmailSent(true);
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async () => {
    if (!email || !password) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Ungültige E-Mail oder Passwort.');
        return;
      }

      // Success - call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectUrl || '/dashboard');
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use current pathname as fallback (fixes SSR issue where redirectUrl prop is undefined)
      const finalRedirectUrl = redirectUrl ||
        (window.location.pathname !== '/auth/login' ? window.location.pathname : undefined);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: finalRedirectUrl
            ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(finalRedirectUrl)}`
            : `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError('Fehler beim Senden der E-Mail. Bitte versuche es erneut.');
        return;
      }

      setEmailSent(true);
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setShowEmailForm(false);
    setShowPasswordForm(false);
    setEmail('');
    setPassword('');
    setError(null);
    setEmailSent(false);
  };

  // Success state after email sent
  if (emailSent) {
    return (
      <div className={`flex flex-col items-center gap-4 ${compact ? 'w-full' : 'w-full min-w-xs max-w-md'}`}>
        <div className="flex flex-col gap-2 items-center">
          {/* Success Icon */}
          <div className="w-10 h-10 bg-interactive-positive-default rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-interactive-positive-default"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-subsection-h3 text-primary">Magic Link verschickt!</h3>
        </div>
        <p className="text-body-m text-secondary text-center">
          Wir haben dir eine E-Mail an <strong>{email}</strong> geschickt. Bitte überprüfe dein
          Postfach und klicke auf den Link.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button variant="secondary" size="sm" fullWidth onClick={handleBackToOptions}>
            Andere E-Mail verwenden
          </Button>
          {!compact && (
            <Button variant="tertiary" size="sm" fullWidth onClick={() => router.push('/')}>
              Zurück zur Startseite
            </Button>
          )}
        </div>
        <div className="p-4 bg-secondary rounded-xs">
          <p className="text-body-xs text-tertiary">
            <strong>Hinweis:</strong> Der Link ist 1 Stunde gültig. Überprüfe auch deinen
            Spam-Ordner.
          </p>
        </div>
      </div>
    );
  }

  // Password form state (existing user)
  if (showPasswordForm) {
    return (
      <div className={`flex flex-col items-center gap-4 ${compact ? 'w-full' : 'w-full min-w-xs max-w-md'}`}>
        <div className="text-center">
          <h3 className="text-title-body-h4 text-primary mb-2">Willkommen zurück!</h3>
          <p className="text-body-s text-secondary">{email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full p-3 bg-negative-subtle rounded-md">
            <p className="text-negative text-sm">{error}</p>
          </div>
        )}

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
          size={compact ? 'md' : 'lg'}
          fullWidth
          onClick={handlePasswordSignIn}
          loading={loading}
          disabled={!password.trim()}
        >
          Anmelden
        </Button>

        <div className="text-center text-body-s text-secondary">oder</div>

        <Button
          variant="secondary"
          size={compact ? 'md' : 'lg'}
          fullWidth
          onClick={handleSendMagicLink}
          loading={loading}
        >
          Magic Link senden
        </Button>

        <button
          onClick={handleBackToOptions}
          className="text-body-s text-link-default hover:text-link-hover underline"
          disabled={loading}
        >
          Andere E-Mail verwenden
        </button>
      </div>
    );
  }

  // Email form state
  if (showEmailForm) {
    return (
      <div
        className={`flex flex-col items-center gap-4 ${compact ? 'w-full' : 'w-full min-w-xs max-w-md'}`}
      >
        {/* Error Message */}
        {error && (
          <div className="w-full p-3 bg-negative-subtle rounded-md">
            <p className="text-negative text-sm">{error}</p>
          </div>
        )}

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

        <Divider />

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
    );
  }

  // Default state - Auth options
  return (
    <div className={`flex flex-col items-center ${compact ? 'w-full' : 'w-full min-w-xs max-w-md'}`}>
      {/* Error Message */}
      {error && (
        <div className="w-full p-3 bg-negative-subtle rounded-md mb-4">
          <p className="text-negative text-sm">{error}</p>
        </div>
      )}

      {/* Auth Options */}
      <div className="flex flex-col justify-center gap-4 w-full">
        {/* Google OAuth */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading}
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          }
        >
          Mit Google fortfahren
        </Button>

        {/* Passkey - Coming Soon */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          disabled={true}
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.65 10A5.99 5.99 0 0 0 7 4a6 6 0 0 0-6 6c0 1.54.58 2.94 1.53 4A5.98 5.98 0 0 0 7 16a5.99 5.99 0 0 0 5.65-4H17l2 2 2-2 2 2 1.5-1.5L21 9h-8.35zM7 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
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

      {/* Legal Text */}
      {showLegalText && !showEmailForm && (
        <div className="text-center mt-4">
          <p className="text-body-xs text-tertiary">
            Mit der Anmeldung akzeptierst du unsere{' '}
            <Link
              href="/agb"
              className="text-link-default hover:text-link-hover underline"
            >
              AGB
            </Link>{' '}
            und{' '}
            <Link
              href="/datenschutz"
              className="text-link-default hover:text-link-hover underline"
            >
              Datenschutzbestimmungen
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
