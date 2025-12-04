'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || undefined;

  // Check for auth errors from callback
  const authError = searchParams.get('error');

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
              <span className="font-satoshi text-xl font-medium">Gedenkseiten.ai</span>
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
              <h1 className="text-section-h2 text-primary">Deine Wahl.</h1>
              <p className="text-body-l text-secondary">
                Erstelle dein persönliches Gedenkseiten.ai Konto oder logge dich ein.
              </p>
            </div>

            {/* Auth Error from Callback */}
            {authError && (
              <div className="mb-6 p-4 bg-error-message border border-message-error rounded-xs">
                <p className="text-body-s text-message-error">
                  Anmeldung fehlgeschlagen. Bitte versuche es erneut.
                </p>
              </div>
            )}

            {/* AuthForm Component */}
            <AuthForm redirectUrl={redirectUrl} showLegalText={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
