'use client';

// Thin wrapper around GA4 (window.gtag, loaded in layout.tsx) and Vercel Web
// Analytics' custom-event track() — the two tools this app sends events to (see
// layout.tsx for how each is loaded). Every call site just calls trackEvent();
// this file is the one place that knows there are two destinations, and each is
// wrapped so a blocked/absent script (an ad blocker, or a Vercel plan without
// custom events) never breaks the calling code.
import { track as vercelTrack } from '@vercel/analytics';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    window.gtag?.('event', name, params);
  } catch {
    // GA4 not loaded — ignore
  }
  try {
    vercelTrack(name, params);
  } catch {
    // Vercel Analytics not loaded/enabled on this plan — ignore
  }
}

// Which version of the app an event happened in — 'default', or a partner's own
// slug (e.g. 'cell-medics') — so all three versions can be filtered separately in
// both GA4 and Vercel's dashboards from the same shared property/project.
export function appVersion(partnerSlug: string | undefined | null): string {
  return partnerSlug ?? 'default';
}
