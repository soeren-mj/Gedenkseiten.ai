'use client';

import AuthForm from '@/components/auth/AuthForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  title?: string;
}

/**
 * LoginModal - Modal for unauthenticated users to login
 *
 * Styled like CookieBanner, uses AuthForm component for login logic.
 * Supports Google OAuth, Email with Magic Link, and Password login.
 */
export default function LoginModal({
  isOpen,
  onClose,
  redirectUrl,
  title = 'Anmelden',
}: LoginModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bw-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="max-w-[611px] p-3 rounded-lg backdrop-blur-xl relative"
        style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-xs hover:bg-secondary transition-colors z-10"
          aria-label="Schließen"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="rounded-[1rem] overflow-hidden p-6 bg-primary flex flex-col justify-start items-center gap-4 w-full min-w-xs max-w-md">
          {/* Title */}
          <div className="text-center mb-2">
            <h3 className="text-primary text-xl font-semibold mb-2">{title}</h3>
            <p className="text-secondary text-sm">
              Melde dich an, um mit der Gedenkseite zu interagieren.
            </p>
          </div>

          {/* AuthForm Component */}
          <AuthForm
            redirectUrl={redirectUrl}
            onSuccess={onClose}
            showLegalText={true}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}
