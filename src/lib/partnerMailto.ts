import { BundleItem } from '../types';
import { PartnerConfig } from './partners';

export type PartnerMode = 'rep' | 'customer';

interface BuildPartnerMailtoArgs {
  partner: PartnerConfig;
  mode: PartnerMode;
  deviceName: string;
  source: 'certified' | 'escalation' | 'manual';
  escalationRequest?: string;
  liveProducts: BundleItem[];
  qtys: number[];
}

// Builds the single mailto: used for every "contact sales" entry point in partner
// mode (the Bundle step's CTA, the certified-yes path, and the unmet-feature
// escalation banner) — plain text only, since no mail client (Outlook, Gmail, Apple
// Mail, mobile included) renders HTML/tables inside a mailto body.
//
// Rep mode ("Send a Quote"): blank To (the rep fills in the customer's address
// themselves), CC'd to the partner's own contactEmail per the spec, quote-style body
// with blank Customer:/Rep: lines for the rep to fill in by hand.
//
// Customer mode ("Contact sales"): addressed directly to the partner's contactEmail,
// a simpler "get in touch" body.
export function buildPartnerMailto({
  partner, mode, deviceName, source, escalationRequest, liveProducts, qtys,
}: BuildPartnerMailtoArgs): string {
  const isRep = mode === 'rep';
  const showBundle = source === 'escalation' || source === 'manual';
  const total = liveProducts.reduce((sum, p, i) => sum + p.unitPrice * (qtys[i] ?? 0), 0);

  const subject = isRep
    ? `Bundle Quote from ${partner.name}`
    : `Contact request — ${deviceName} bundle`;

  const lines: string[] = [];
  if (isRep) {
    lines.push('Customer: ', 'Rep: ', '');
  }
  lines.push(`Device: ${deviceName}`);
  if (source === 'escalation' && escalationRequest) {
    lines.push(`Request: "${escalationRequest}"`);
  }
  if (showBundle && liveProducts.length > 0) {
    lines.push('', 'Recommended bundle:', '');
    liveProducts.forEach((p, i) => {
      const qty = qtys[i] ?? 0;
      if (qty === 0) return;
      lines.push(`• ${p.type}: ${p.name} (${p.sku}) ×${qty} — $${(p.unitPrice * qty).toFixed(2)}`);
    });
    lines.push('', `Sub-total: $${total.toFixed(2)}`);
  }
  lines.push('', '---', 'No data from this session is stored — this email is the only record of these selections.');

  const body = lines.join('\n');
  // Built with encodeURIComponent (matches Share Bundle's existing mailto below), not
  // URLSearchParams — URLSearchParams form-encodes spaces as "+", which the mailto URI
  // spec doesn't guarantee every mail client will treat as a space in the body.
  const parts = [`subject=${encodeURIComponent(subject)}`, `body=${encodeURIComponent(body)}`];
  if (isRep && partner.contactEmail) parts.push(`cc=${encodeURIComponent(partner.contactEmail)}`);

  const to = !isRep ? (partner.contactEmail ?? '') : '';
  return `mailto:${to}?${parts.join('&')}`;
}
