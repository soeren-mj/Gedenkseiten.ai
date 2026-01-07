'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';

interface CookieConsent {
  analytics: boolean;
  necessary: boolean;
}

const defaultConsent: CookieConsent = {
  analytics: false,
  necessary: true,
};

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

// Helper functions for cookie management
const COOKIE_NAME = 'cookie-consent';
const COOKIE_MAX_AGE = 15768000; // 6 months in seconds (DSGVO-konform)

function getCookieConsent(): CookieConsent | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function setCookieConsent(consent: CookieConsent): void {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    // Check cookie instead of localStorage
    const savedConsent = getCookieConsent();
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      setConsent(savedConsent);
    }
  }, []);

  // Analytics Switch Handler
  const handleAnalyticsSwitch = (checked: boolean) => {
    setConsent((prev) => {
      const updated = { ...prev, analytics: checked };
      setCookieConsent(updated);
      if (checked && typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ event: 'analytics_consent_granted' });
      }
      return updated;
    });
  };

  // Weiter ohne Zustimmung
  const handleDecline = () => {
    const onlyNecessary: CookieConsent = { analytics: false, necessary: true };
    setConsent(onlyNecessary);
    setCookieConsent(onlyNecessary);
    setShowBanner(false);
  };

  // Zustimmen
  const handleAccept = () => {
    const fullConsent: CookieConsent = { analytics: true, necessary: true };
    setConsent(fullConsent);
    setCookieConsent(fullConsent);
    setShowBanner(false);
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'analytics_consent_granted' });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="max-w-2xl p-2 rounded-lg backdrop-blur-xl"
        style={{ boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.1)' }}
      >
        <div
        className="rounded-md overflow-hidden p-4 bg-primary inline-flex flex-col justify-start items-start gap-6"
      >
        {/* Weiter ohne Zustimmung */}
        <button
          onClick={handleDecline}
          className="justify-center p-1 text-secondary text-xs tracking-tight hover:text-primary transition-colors"
        >
          Weiter ohne Zustimmung
        </button>
        {/* Haupttext */}
        <div className="self-stretch justify-center text-primary">
          <h5> Herzlich Willkommen, wir verwenden Cookies, um deine Erfahrung auf unserer Website zu verbessern. Einige sind technisch notwendig, andere helfen uns, die Website zu optimieren.</h5>
        </div>
        <div>
        {/* Notwendige Cookies */}
        <div className="w-full max-w-[825px] min-w-72 inline-flex justify-between items-center">
          <div>
            <div className="self-stretch justify-center text-primary text-sm font-semibold font-['Inter'] leading-[1.75rem]">Notwendige Cookies</div>
            <div className="self-stretch justify-center text-secondary text-xs">Essentiell damit die Seiten funktionieren. Immer an.</div>
          </div>
          <Switch checked={true} onCheckedChange={() => {}} disabled variant="cookie" />
        </div>
        {/* Analyse Cookies */}
        <div className="w-full pt-4 max-w-[825px] min-w-72 inline-flex justify-between items-center">
          <div>
            <div className="self-stretch justify-center text-primary text-sm font-semibold font-['Inter'] leading-[1.75rem]">Analyse Cookies</div>
            <div className="self-stretch justify-center text-secondary text-xs">Werden zur Messung der Nutzung erhoben, <br />um das Erlebnis zu verbessern.</div>
          </div>
          <Switch checked={consent.analytics} onCheckedChange={handleAnalyticsSwitch} variant="cookie" />
        </div>
        </div>
        {/* Zustimmen Button */}
        <div className="w-full flex pt-6 justify-center"> 
        <Button
          onClick={handleAccept}
          size="md"
        >
          Zustimmen
        </Button>
        </div>
      </div>
      </div>
    </div>
  );
} 