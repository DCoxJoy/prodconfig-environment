// Channel-partner configuration — see CLAUDE.partner-mode.md for the full spec.
// A small static map, not a database: adding a partner or populating a SKU
// allowlist is a one-line edit here and a redeploy, never a schema/infra change.

export interface PartnerConfig {
  slug: string;
  name: string;
  logoUrl?: string;
  skuAllowlist: string[]; // empty array = no restriction (full catalog)
  brandColor?: string; // overrides the app's --color-brand accent (red) for this partner; unset = default red
}

export const PARTNERS: Record<string, PartnerConfig> = {
  'cell-medics': {
    slug: 'cell-medics',
    name: 'Cell Medics LTD',
    skuAllowlist: [], // populate once Cell Medics LTD provides their SKU list
    brandColor: '#ea526f', // Cell Medics LTD's own brand color
  },
  'partner-one': {
    slug: 'partner-one',
    name: 'Partner One IT',
    skuAllowlist: [], // populate once this partner provides their SKU list
    brandColor: '#0071EB', // Partner One's own brand color
  },
};

export function getPartner(slug: string): PartnerConfig | null {
  return PARTNERS[slug] ?? null;
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
