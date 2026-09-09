'use client';

// Thin wrapper around GA4 and Vercel Web Analytics' custom-event track() — the two
// tools this app sends events to. Every call site just calls trackEvent(); this file
// is the one place that knows there are two destinations.
//
// GA4 events go through /api/analytics/collect (server-side Measurement Protocol)
// rather than calling window.gtag('event', ...) directly — a direct client-side call
// was confirmed to never reach GA4 when the app is embedded (third-party-iframe
// tracker blocking in the visitor's browser). Routing through our own server sidesteps
// that entirely, for both the embedded and direct-visit cases alike. layout.tsx's
// gtag.js script still loads independently of this — it's what drives GA4's own
// automatic page_view/session tracking, untouched by this change.
import { track as vercelTrack } from '@vercel/analytics';

const GA_MEASUREMENT_ID = 'G-2NYWBB5T4Q';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function getFallbackClientId(): string {
  const STORAGE_KEY = 'ga_client_id';
  const generate = () =>
    crypto.randomUUID?.() ?? `${Date.now()}.${Math.random().toString(36).slice(2)}`;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const id = generate();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private browsing, disabled) — event still sends,
    // just without stitching across this visitor's other events.
    return generate();
  }
}

// Stable per-visitor id GA4 uses to stitch these events into one user/session
// timeline. Prefers gtag.js's own client_id — GA4 already has a session/user history
// for it via gtag's automatic page_view/session_start events, so our custom events
// join that same journey instead of appearing as a disconnected identity GA4 can't
// build a coherent session around. Falls back to a self-generated, localStorage-
// persisted id when gtag isn't available (or doesn't answer within 300ms) — that's
// exactly the embedded/blocked case this whole relay exists to survive, so this can
// never block on gtag. Resolved once and cached for the rest of the page's lifetime.
let cachedClientId: string | null = null;
let clientIdPromise: Promise<string> | null = null;

function getClientId(): Promise<string> {
  if (cachedClientId) return Promise.resolve(cachedClientId);
  if (clientIdPromise) return clientIdPromise;

  clientIdPromise = new Promise((resolve) => {
    let settled = false;
    const settle = (id: string) => {
      if (settled) return;
      settled = true;
      cachedClientId = id;
      resolve(id);
    };
    try {
      if (window.gtag) {
        window.gtag('get', GA_MEASUREMENT_ID, 'client_id', (id: unknown) => {
          settle(typeof id === 'string' && id ? id : getFallbackClientId());
        });
        setTimeout(() => settle(getFallbackClientId()), 300);
      } else {
        settle(getFallbackClientId());
      }
    } catch {
      settle(getFallbackClientId());
    }
  });
  return clientIdPromise;
}

export function trackEvent(name: string, params: EventParams = {}): void {
  getClientId().then((clientId) => {
    try {
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          name,
          // page_location tells GA4 what page/hostname this event happened on — a
          // server-relayed event has no browser context of its own to infer that
          // from, so without this every event lands with Hostname/page dimensions
          // "(not set)", silently excluding them from any Hostname-scoped segment.
          params: { ...params, page_location: location.href, page_title: document.title },
        }),
        // Lets the request complete even if it's fired right before the tab/iframe
        // closes (e.g. the step_exit calls sent from a pagehide listener). cachedClientId
        // is set by the time any real exit fires (step_view already resolved it on
        // page load), so this .then() runs as an immediate microtask, not a delay.
        keepalive: true,
      });
    } catch {
      // fetch unavailable — ignore, matches the fire-and-forget pattern below
    }
  });
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
