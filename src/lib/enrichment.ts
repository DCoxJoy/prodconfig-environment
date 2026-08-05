import { FeatureId } from '../types';

export interface ProductEnrichment {
  // Array — a mount can support multiple surfaces (e.g. a flat-panel mount works wall + desk/counter).
  // bundle_priority is per-SKU, not per-surface, so an HD mount keeps its priority bonus on every surface it lists.
  mount_surface?: Array<'wall' | 'vehicle' | 'desk' | 'pole' | 'na'>;
  features?: FeatureId[];
  series?: 'Extreme' | 'Bold' | 'Slim' | 'Edge' | 'Standard' | 'Pro' | 'Go';
  bundle_priority?: number;
  // Override BC solution_type for scoring — use when BC field is missing or incorrect.
  // Values must match BC solution_type vocabulary: 'drill down', 'adhesive', 'rail/pole'.
  solution_type_override?: string[];
  // Accessories only — restricts this accessory to bundles whose selected case SKU is
  // in this list (e.g. a cable kit built specifically for one case's port cover). When
  // unset, the accessory is eligible for any case (existing device_compatibility rules
  // still apply on top of this).
  compatible_case_skus?: string[];
}

// In-memory cache for runtime Claude-inferred enrichment (fills gaps for SKUs not in static map).
// Persists per server process — each Vercel serverless instance has its own cache.
export const runtimeEnrichmentCache = new Map<string, ProductEnrichment>();

// Static enrichment map — seed by running: POST /api/admin/enrich
// Paste the returned `typescript` field value into the object below.
// Manually extend it as new SKUs are added to BC.
// Generated: 2026-06-26T22:44:13.965Z via POST /api/admin/enrich
// Re-run that endpoint and paste updated output here when new SKUs are added to BC.
// Empty {} entries are intentional — they mark known SKUs so runtime Claude inference is skipped.
export const PRODUCT_ENRICHMENT: Record<string, ProductEnrichment> = {
  'CWX202':    { features: ['shoulder_strap'] },
  'MMU116':    { mount_surface: ['vehicle'] },
  'MCU103':    { features: ['kensington_lock'] },
  'MNU515':    { mount_surface: ['wall'] },
  'KKX107':    {},
  'MMU115':    { mount_surface: ['wall', 'desk'] },
  'MMX107':    {},
  'MMU104':    { mount_surface: ['wall', 'desk'] },
  'KKX104':    {},
  'MMU102':    { mount_surface: ['vehicle'] },
  'MMU117':    { mount_surface: ['vehicle', 'desk'] },
  'MNU511':    { mount_surface: ['desk'] },
  'MNU502':    { mount_surface: ['vehicle'] },
  'MMU111':    { mount_surface: ['desk'] },
  'SCU102':    { features: ['kensington_lock'] },
  'CWX205':    { features: ['hand_strap'] },
  'MMX115KL':  { features: ['kensington_lock'] },
  'CWM400MP':  { features: ['magconnect'], series: 'Edge', bundle_priority: 2 },
  'MNU504':    { mount_surface: ['wall', 'desk'] },
  'MMU205':    { mount_surface: ['vehicle'] },
  'KKX103':    {},
  'MMX108':    { features: ['hand_strap'] },
  'MMU103':    { mount_surface: ['vehicle'] },
  'MMU118':    { mount_surface: ['pole'] },
  'KKX101':    {},
  'CWX134':    {},
  'CWX132':    { features: ['screen_protector'] },
  'MNU005':    { mount_surface: ['vehicle'] },
  'CWX210':    {},
  'KKX110W':   {},
  'KKX110B':   {},
  'MMU332':    { mount_surface: ['vehicle', 'desk'], bundle_priority: 1 },
  'MMU331':    { mount_surface: ['wall', 'desk'],    bundle_priority: 1 },
  // VESA mounts — drill-only (no adhesive). solution_type_override ensures drill preference wins
  // over HD (drill+adhesive) mounts regardless of whether BC has solution_type set.
  'MVU332':    { mount_surface: ['wall', 'desk'],    bundle_priority: 1, solution_type_override: ['drill down'] },
  'MMU231':    { mount_surface: ['wall', 'desk'],    bundle_priority: 1 },
  'MMU230':    { mount_surface: ['pole'],            bundle_priority: 1 },
  'MMU232':    { mount_surface: ['vehicle', 'desk'], bundle_priority: 1 },
  'MVU232':    { mount_surface: ['wall', 'desk'],    bundle_priority: 1, solution_type_override: ['drill down'] },
  'RVU101':    { mount_surface: ['wall'],            bundle_priority: 1, solution_type_override: ['drill down'] },
  // Bold — VESA + MagConnect compatible
  'CWA302MP':  { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 1 },
  'MWA336MP':  { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA652MP':  { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA302KL':  { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA653KL':  { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA5122MP': { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA5123MP': { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA4123MP': { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  'CWA4122MP': { features: ['vesa_compatible', 'magconnect'], series: 'Bold',    bundle_priority: 2 },
  // Extreme (displayable SKUs) — VESA 100 + MagConnect compatible
  'CWM347MP':  { features: ['vesa_compatible', 'magconnect'], series: 'Extreme', bundle_priority: 1 },
  'HTA6024':   { features: ['vesa_compatible', 'magconnect'], series: 'Extreme', bundle_priority: 1 },
  // Extreme (non-displayable / RFQ) — no mount features
  'HTA3021':   { series: 'Extreme', bundle_priority: 1 },
  'HPA3024':   { series: 'Extreme', bundle_priority: 1 },
  'HPA3224':   { series: 'Extreme', bundle_priority: 1 },
  // Slim — MagConnect only (no VESA holes)
  'CWA655MH':  { features: ['magconnect'],          series: 'Slim',    bundle_priority: 2 },
  'CWA305MH':  { features: ['magconnect'],          series: 'Slim',    bundle_priority: 2 },
  'CWA655MP':  { features: ['magconnect'],          series: 'Slim',    bundle_priority: 2 },
  'CWA5152MH': { features: ['magconnect', 'magsafe'], series: 'Slim',  bundle_priority: 2 },
  'CWA4152MH': { features: ['magconnect', 'magsafe'], series: 'Slim',  bundle_priority: 2 },
  // Pro — MagConnect only
  'CWM349MP':  { features: ['magconnect'],          series: 'Pro',     bundle_priority: 1 },
  'CWA659MP':  { features: ['magconnect'],          series: 'Pro',     bundle_priority: 1 },
  // Go — MagConnect only
  'CWM344MP':  { features: ['magconnect'],          series: 'Go',      bundle_priority: 2 },
  // Edge (tablet) — MagConnect only
  'CWM331MP':  { features: ['magconnect'],          series: 'Edge',    bundle_priority: 2 },
  // Edge (iPhone) — no mount features; iPhones don't get mounts
  'CPA310HS':  { features: ['hand_strap', 'shoulder_strap'], series: 'Edge', bundle_priority: 1 },
  'CPA310S':   { series: 'Edge', bundle_priority: 2 },
  'CPA320S':   { series: 'Edge', bundle_priority: 2 },
  'CPA330S':   { series: 'Edge', bundle_priority: 2 },
  // Standard — compatibility unknown; no mount features set
  'CWM504MP':  { series: 'Standard', bundle_priority: 2 },
  'MCU203':    {},
  'MCU204':    {},
  'CWX144':    { features: ['shoulder_strap'] },
  'MMU217':    { mount_surface: ['na'] },
  // Port-cover cable kit built specifically for the aXtion Pro CWA659MP — physically
  // incompatible with any other case's port cover design.
  'PCA213':    { compatible_case_skus: ['CWA659MP'] },
  'CPX302':    {},
};

export function getEnrichment(sku: string): ProductEnrichment {
  const base = PRODUCT_ENRICHMENT[sku] ?? runtimeEnrichmentCache.get(sku) ?? {};

  // Kensington lock compatibility is deterministic from the SKU itself — Bold-series
  // cases whose SKU ends in "KL" have the physical lock slot; no other case does.
  // Computed here (rather than hand-curated per SKU) so it can't drift out of date
  // as new KL SKUs are added to BC, and applies even to SKUs with no manual entry above.
  if (sku.toUpperCase().endsWith('KL') && !base.features?.includes('kensington_lock')) {
    return { ...base, features: [...(base.features ?? []), 'kensington_lock'] };
  }
  return base;
}

export function hasEnrichment(sku: string): boolean {
  return sku in PRODUCT_ENRICHMENT || runtimeEnrichmentCache.has(sku);
}
