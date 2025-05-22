'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { event } from '@/lib/analytics';

export default function NotFound() {
  useEffect(() => {
    // Log 404 to analytics
    event({
      action: '404',
      category: 'error',
      label: window.location.pathname,
    });
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">
          Diese Seite wurde nicht gefunden
        </h2>
        <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
          Die von dir gesuchte Seite existiert leider nicht oder wurde möglicherweise verschoben.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
} 