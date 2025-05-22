declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
type GtagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
};

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Custom events for waitlist
export const waitlistEvents = {
  startRegistration: () => event({
    action: 'start_registration',
    category: 'waitlist',
    label: 'start',
  }),
  completeRegistration: () => event({
    action: 'complete_registration',
    category: 'waitlist',
    label: 'complete',
  }),
  confirmEmail: () => event({
    action: 'confirm_email',
    category: 'waitlist',
    label: 'confirm',
  }),
}; 