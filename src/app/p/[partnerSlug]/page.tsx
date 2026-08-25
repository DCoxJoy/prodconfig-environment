import { notFound } from 'next/navigation';
import { getPartner } from '../../../lib/partners';
import ConfiguratorApp from '../../../components/ConfiguratorApp';

// Branded, catalog-scoped variant of the configurator for a channel partner — see
// CLAUDE.partner-mode.md. Partner identity is resolved here, server-side, before any
// catalog/enrichment logic runs; an unknown slug 404s rather than silently falling
// back to the default (unbranded, unscoped) app.
export default async function PartnerPage({
  params,
}: {
  params: Promise<{ partnerSlug: string }>;
}) {
  // Kill switch, independent of a redeploy — set PARTNER_MODE_ENABLED=false in the
  // environment to take every partner route down at once without touching code.
  if (process.env.PARTNER_MODE_ENABLED === 'false') notFound();

  const { partnerSlug } = await params;
  const partner = getPartner(partnerSlug);
  if (!partner) notFound();

  return <ConfiguratorApp partner={partner} />;
}
