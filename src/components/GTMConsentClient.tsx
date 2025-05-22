'use client';
import { useEffect, useState } from 'react';
import { GTM } from './GTM';

export function GTMConsentClient() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = JSON.parse(localStorage.getItem('cookie-consent') || '{}');
      setAnalyticsAllowed(!!consent.analytics);
    }
  }, []);

  if (!analyticsAllowed) return null;
  return <GTM gtmId="GTM-P27C3RV9" />;
} 