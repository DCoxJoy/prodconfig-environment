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

type EventParams = Record<string, string | number | boolean | undefined>;

// Stable per-visitor id GA4 uses to stitch these events into one user/session
// timeline, generated once and reused from localStorage. Deliberately independent of
// gtag.js's own client_id — that would mean depending on gtag having loaded and run
// successfully, which is exactly what's unreliable in the embedded case this exists
// to work around.
function getClientId(): string {
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

export function trackEvent(name: string, params: EventParams = {}): void {
  try {
    fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: getClientId(),
        name,
        // page_location tells GA4 what page/hostname this event happened on — a
        // server-relayed event has no browser context of its own to infer that from,
        // so without this every event lands with Hostname/page dimensions "(not set)",
        // silently excluding them from any Hostname-scoped segment (e.g. App traffic).
        params: { ...params, page_location: location.href, page_title: document.title },
      }),
      // Lets the request complete even if it's fired right before the tab/iframe
      // closes (e.g. the step_exit calls sent from a pagehide listener).
      keepalive: true,
    });
  } catch {
    // fetch unavailable — ignore, matches the fire-and-forget pattern below
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
