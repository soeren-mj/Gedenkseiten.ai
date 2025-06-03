'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

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

// Custom Switch Component (Figma Style)
function Switch({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  let baseBg = '';
  let style = {};
  if (disabled) {
    baseBg = '';
    style = { opacity: 0.4, background: '#17E562' };
  } else if (checked) {
    baseBg = 'bg-[#17E562]';
  } else {
    baseBg = 'bg-[#4B4F68]';
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${baseBg}`}
      style={style}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (!savedConsent) {
      setShowBanner(true);
    }
  }, []);

  // Analytics Switch Handler
  const handleAnalyticsSwitch = (checked: boolean) => {
    setConsent((prev) => {
      const updated = { ...prev, analytics: checked };
      localStorage.setItem('cookie-consent', JSON.stringify(updated));
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
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    setShowBanner(false);
  };

  // Zustimmen
  const handleAccept = () => {
    const fullConsent: CookieConsent = { analytics: true, necessary: true };
    setConsent(fullConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setShowBanner(false);
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: 'analytics_consent_granted' });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="max-w-[611px] p-6 rounded-3xl shadow-[1px_1px_10px_1px_rgba(210,211,217,0.20)] backdrop-blur-[20px] inline-flex flex-col justify-start items-start gap-6"
        style={{ background: 'rgba(0,0,0,0.86)' }}
      >
        {/* Weiter ohne Zustimmung */}
        <button
          onClick={handleDecline}
          className="justify-center p-1 text-gray-400 text-xs tracking-tight hover:text-gray-200 transition-colors"
        >
          Weiter ohne Zustimmung
        </button>
        {/* Haupttext */}
        <div className="self-stretch justify-center text-foreground-primary">
          <h5 className="leading-[1.6rem]">Herzlich Willkommen, wir verwenden Cookies, um deine Erfahrung auf unserer Website zu verbessern. Einige sind technisch notwendig, andere helfen uns, die Website zu optimieren.</h5>
        </div>
        <div>
        {/* Notwendige Cookies */}
        <div className="w-full max-w-[825px] min-w-72 inline-flex justify-between items-center">
          <div>
            <div className="self-stretch justify-center text-foreground-primary text-sm font-semibold font-['Inter'] leading-[1.75rem]">Notwendige Cookies</div>
            <div className="self-stretch justify-center text-[#AAADBF] text-xs leading-[1.75rem]">Essentiell damit die Seiten funktionieren. Immer an.</div>
          </div>
          <Switch checked={true} onChange={() => {}} disabled />
        </div>
        {/* Analyse Cookies */}
        <div className="w-full pt-4 max-w-[825px] min-w-72 inline-flex justify-between items-center">
          <div>
            <div className="self-stretch justify-center text-foreground-primary text-sm font-semibold font-['Inter'] leading-[1.75rem]">Analyse Cookies</div>
            <div className="self-stretch justify-center text-[#AAADBF] text-xs leading-[1.75rem]">Werden zur Messung der Nutzung erhoben, um das Erlebnis zu verbessern.</div>
          </div>
          <Switch checked={consent.analytics} onChange={handleAnalyticsSwitch} />
        </div>
        </div>
        {/* Zustimmen Button */}
        <div className="w-full flex pt-6 justify-center"> 
        <Button
          onClick={handleAccept}
          size="m"
          
        >
          Zustimmen
        </Button>
        </div>
      </div>
    </div>
  );
} 