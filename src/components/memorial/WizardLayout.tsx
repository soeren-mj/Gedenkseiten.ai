'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface WizardLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  /** Optional greeting text for sidebar */
  greetingText?: string;
  /** Optional help text for sidebar */
  helpText?: string;
  /** Back button text (default: "Zurück") */
  backButtonText?: string;
  /** Back button action (default: go to dashboard) */
  onBack?: () => void;
  /** Optional preview card to show in sidebar (e.g., for summary page) */
  sidebarPreview?: React.ReactNode;
  /** Optional footer content (e.g., navigation buttons) - sticky at bottom */
  footerContent?: React.ReactNode;
}

/**
 * WizardLayout Component
 *
 * Main layout for memorial creation wizard
 * Matches Dashboard design with same background, opacity, and layout
 *
 * Features:
 * - Left sidebar (1/4 width) with logo, personalized greeting and help text
 * - Content area (3/4 width) with cancel/title bar at top and wizard steps
 * - Same blur background as dashboard
 * - Responsive
 */
export function WizardLayout({
  children,
  showSidebar = true,
  greetingText,
  helpText,
  backButtonText = 'Zurück',
  onBack,
  sidebarPreview,
  footerContent
}: WizardLayoutProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Get user's first name for greeting
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Background Image */}
      <div className="fixed inset-0 -z-1">
        <Image
          src="/images/blur-default-0.75.webp"
          alt="Background"
          fill
          className="object-cover object-center scale-[1.22]"
          priority
        />
      </div>

      {/* Content Area - Full Screen, No Padding */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Sidebar - 1/4 width, Same styling as Dashboard */}
        {showSidebar && (
          <aside className="hidden md:flex w-1/4 bg-bw-opacity-40 h-full p-6 flex-col justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-gedenkseiten.ai-white-x4.png"
                alt="Gedenkseiten.ai"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-primary font-satoshi text-lg font-semibold">
                Gedenkseiten.ai
              </span>
            </div>

            {/* Personalized Greeting or Preview Card */}
            <div className="flex">
              {sidebarPreview ? (
                // Show preview card if provided (e.g., on summary page)
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h2 className="text-body-m text-primary">
                      <span className="font-semibold">{userName}</span>, du hast es so gut wie geschafft.
                    </h2>
                    <p className="text-body-s text-primary leading-relaxed">
                      {greetingText || 'Hier eine kurze Zusammenfassung. Du kannst gern weitermachen und deine Gedenkseite mit persönlichen Inhalten versehen.'}
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div>{sidebarPreview}</div>
                </div>
              ) : (
                // Default greeting
                <div className="flex flex-col pb-4 border-b border-hover">
                  <h2 className="text-body-m text-primary pb-1">
                    Hallo <span className="font-semibold">{userName}</span>,
                  </h2>
                  <p className="text-body-s text-primary leading-relaxed">
                    {greetingText || 'hier kannst du eine neue Gedenkseite erstellen. Du hast die Wahl zwischen einer Gedenkseite für eine Person oder einem Tier.'}
                  </p>
                  {helpText && (
                    <p className="text-body-s text-primary leading-relaxed">
                      {helpText}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Support Buttons at bottom */}
            <div className="flex gap-2 justify-between flex-shrink-0">
              <Button
                variant="text"
                size="sm"
                onClick={() => router.push('/support')}
                className="w-full justify-start p-2"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              >
                Hilfe anfordern
              </Button>

              <Button
                variant="text"
                size="sm"
                onClick={() => router.push('/report')}
                className="w-full justify-start text-left p-2"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                }
              >
                Fehler melden
              </Button>
            </div>
          </aside>
        )}

        {/* Main Content - 3/4 width, Same styling as Dashboard */}
        <main className="w-3/4 h-full bg-bw-opacity-60 backdrop-blur-lg mb-4 flex flex-col">
          {/* Top Bar with Back/Cancel and Title */}
          <div className="sticky top-0 px-8 py-4 relative flex justify-center items-center z-20">
            {/* Back/Cancel Button - Absolute Left */}
            <Button
              variant="text"
              size="sm"
              onClick={handleBack}
              className="absolute left-8"
              leftIcon={
                backButtonText === 'Zurück' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                ) : undefined
              }
            >
              {backButtonText}
            </Button>

            {/* Page Title - Centered */}
            <div className="text-webapp-group text-primary">
              Neue Gedenkseite erstellen
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 w-full overflow-y-auto">
            <div className="p-8 flex items-center justify-center">
              <div className="w-full max-w-3xl mx-auto">{children}</div>
            </div>
          </div>

          {/* Sticky Footer - Navigation Buttons */}
          {footerContent && (
            <div className="sticky bottom-0 px-8 py-4 flex justify-center items-center z-20 bg-transparent">
              {footerContent}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
