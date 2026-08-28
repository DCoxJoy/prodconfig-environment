// Channel-partner configuration — see CLAUDE.partner-mode.md for the full spec.
// A small static map, not a database: adding a partner or populating a SKU
// allowlist is a one-line edit here and a redeploy, never a schema/infra change.

export interface PartnerConfig {
  slug: string;
  name: string;
  logoUrl?: string;
  skuAllowlist: string[]; // empty array = no restriction (full catalog)
  brandColor?: string; // overrides the app's --color-brand accent (red) for this partner; unset = default red
  // Enables the rep/customer mailto end-flow (see partnerMailto.ts) for this partner —
  // unset means the partner keeps the original HubSpot-backed Contact Sales form
  // instead, so a partner isn't switched onto an email-only flow with nowhere for
  // that email to go. Setting this is a one-line edit, same as every other field here.
  contactEmail?: string;
  // Displays every BC price (which is always USD) converted into this partner's local
  // currency instead — unset means prices are shown exactly as BC returns them (USD,
  // no label), the default app's behavior. `rate` is a plain multiplier applied to the
  // USD amount; update it directly here if it drifts, no other code changes needed.
  currency?: { code: string; rate: number };
}

export const PARTNERS: Record<string, PartnerConfig> = {
  'cell-medics': {
    slug: 'cell-medics',
    name: 'Cell Medics LTD',
    skuAllowlist: [], // populate once Cell Medics LTD provides their SKU list
    brandColor: '#ea526f', // Cell Medics LTD's own brand color
    contactEmail: 'service@cellmedics.ca', // placeholder, confirmed usable for now
    // Cell Medics LTD is Canadian; BC's catalog prices are USD. Rate is the reciprocal
    // of the CAD→USD rate provided (1 CAD ≈ $0.72 USD, so 1 USD ≈ 1/0.72 ≈ 1.3889 CAD).
    currency: { code: 'CAD', rate: 1.3889 },
  },
  'partner-one-it': {
    slug: 'partner-one-it',
    name: 'Partner One IT',
    skuAllowlist: [], // populate once this partner provides their SKU list
    brandColor: '#0071EB', // Partner One's own brand color
    contactEmail: 'sales@partneroneit.com', // TODO: confirm this is the real address — placeholder from the spec doc
  },
};

export function getPartner(slug: string): PartnerConfig | null {
  return PARTNERS[slug] ?? null;
}

// Formats a BC price (always USD) for display, converting it into a partner's local
// currency when one is configured (see `currency` on PartnerConfig above). No partner,
// or a partner without `currency` set, renders exactly as before: `$129.99`, no label —
// the default app and any partner without a currency override are unaffected.
export function formatPrice(usdAmount: number, partner: PartnerConfig | null): string {
  const currency = partner?.currency;
  const amount = currency ? usdAmount * currency.rate : usdAmount;
  return currency ? `$${amount.toFixed(2)} ${currency.code}` : `$${amount.toFixed(2)}`;
}

// Derives a darker hover shade from a partner's brandColor, matching the ~17% darken
// relationship between the app's own default --color-brand (#c8291c) and
// --color-brand-hover (#a8221a), so a partner only has to supply one color.
export function darkenHex(hex: string, factor = 0.83): string {
  const n = hex.replace('#', '');
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  const r = parseInt(n.slice(0, 2), 16) * factor;
  const g = parseInt(n.slice(2, 4), 16) * factor;
  const b = parseInt(n.slice(4, 6), 16) * factor;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Restricts a candidate product list to a partner's SKU allowlist. A no-op — same
// array, same order — whenever partnerSlug is unset or the partner's allowlist is
// empty, so the default (no-partner) request flow and any partner with a still-empty
// list are completely unaffected.
export function applyPartnerAllowlist<T extends { sku: string }>(items: T[], partnerSlug?: string): T[] {
  if (!partnerSlug) return items;
  const partner = getPartner(partnerSlug);
  if (!partner || partner.skuAllowlist.length === 0) return items;
  const allowed = new Set(partner.skuAllowlist);
  return items.filter(p => allowed.has(p.sku));
}
