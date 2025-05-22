'use client';

import { useState, useEffect } from 'react';
import { event } from '@/lib/analytics';

interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
}

const defaultConsent: CookieConsent = {
  analytics: false,
  marketing: false,
  necessary: true, // Necessary cookies are always required
};

declare global {
  interface Window {
    dataLayer: Array<Record<string, any>>;
  }
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    // Check if consent was already given
    const savedConsent = localStorage.getItem('cookie-consent');
    if (!savedConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      analytics: true,
      marketing: true,
      necessary: true,
    };
    setConsent(fullConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);

    // GTM Custom Event push
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'analytics_consent_granted' });
    }

    event({
      action: 'cookie_consent',
      category: 'privacy',
      label: 'accept_all',
    });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setShowBanner(false);

    // GTM Custom Event push, nur wenn Analytics aktiviert wurde
    if (consent.analytics && typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'analytics_consent_granted' });
    }

    event({
      action: 'cookie_consent',
      category: 'privacy',
      label: 'save_preferences',
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 md:p-6 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Cookie-Einstellungen</h3>
            <p className="text-gray-600 text-sm">
              Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.
              Einige sind technisch notwendig, andere helfen uns, die Website zu optimieren.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Einstellungen
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notwendige Cookies</h4>
                  <p className="text-sm text-gray-600">Diese Cookies sind für die Grundfunktionen der Website erforderlich.</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.necessary}
                  disabled
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analyse Cookies</h4>
                  <p className="text-sm text-gray-600">Helfen uns zu verstehen, wie Besucher mit der Website interagieren.</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Werden verwendet, um Werbung relevanter für Sie zu gestalten.</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              
              <button
                onClick={handleSavePreferences}
                className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Einstellungen speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 