import { NextRequest, NextResponse } from 'next/server';

// Server-side relay to GA4's Measurement Protocol — exists because the browser-side
// gtag('event', ...) call this replaces was confirmed to never reach GA4 when the app
// is embedded (a third-party-iframe tracker restriction on the visitor's browser, not
// anything this app's own code controls). A request from this server to Google's
// collect endpoint has no browser/iframe in the path at all, so it isn't subject to
// that restriction. Vercel Analytics is unaffected by any of this — it already tracks
// every context and keeps sending client-side via @vercel/analytics, untouched.
const GA_MEASUREMENT_ID = 'G-2NYWBB5T4Q';

type EventParams = Record<string, string | number | boolean | undefined>;

// GA4's Measurement Protocol only accepts string/number param values — booleans (e.g.
// `matched`, `mailto_flow` from existing call sites) are stringified rather than
// silently dropped, and undefined values are omitted.
function sanitizeParams(params: EventParams): Record<string, string | number> {
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    clean[key] = typeof value === 'boolean' ? String(value) : value;
  }
  return clean;
}

export async function POST(request: NextRequest) {
  const secret = process.env.GA4_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'GA4_API_SECRET not configured' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const clientId: unknown = body?.client_id;
  const name: unknown = body?.name;
  if (typeof clientId !== 'string' || typeof name !== 'string') {
    return NextResponse.json({ error: 'client_id and name are required' }, { status: 400 });
  }

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${secret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params: sanitizeParams(body?.params ?? {}) }],
      }),
    }
  );

  return NextResponse.json({ ok: true });
}
