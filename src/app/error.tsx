'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Analytics-Event entfernt, da Tracking über GTM läuft
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Entschuldigung, es ist ein Fehler aufgetreten
        </h2>
        <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
          Wir arbeiten daran, das Problem zu beheben. Bitte versuche es später noch einmal
          oder kontaktiere unseren Support, wenn der Fehler weiterhin besteht.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
} 