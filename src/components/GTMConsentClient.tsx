'use client';
import { useEffect, useState } from 'react';
import { GTM } from './GTM';

// Helper to read cookie consent (same as CookieBanner)
function getCookieConsent(): { analytics?: boolean } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/cookie-consent=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function GTMConsentClient() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    setAnalyticsAllowed(!!consent?.analytics);
  }, []);

  if (!analyticsAllowed) return null;
  return <GTM gtmId="GTM-P27C3RV9" />;
} 