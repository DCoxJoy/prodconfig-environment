import { FeatureId } from '../types';

export interface ProductEnrichment {
  mount_surface?: 'wall' | 'vehicle' | 'desk' | 'pole' | 'na';
  features?: FeatureId[];
  series?: 'Extreme' | 'Bold' | 'Slim' | 'Edge' | 'Standard' | 'Pro' | 'Go';
  bundle_priority?: number;
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
  'MMU116':    { mount_surface: 'vehicle' },
  'MCU103':    { features: ['kensington_lock'] },
  'MNU515':    { mount_surface: 'wall' },
  'KKX107':    {},
  'MMU115':    { mount_surface: 'wall' },
  'MMX107':    {},
  'MMU104':    { mount_surface: 'wall' },
  'KKX104':    {},
  'MMU102':    { mount_surface: 'vehicle' },
  'MMU117':    { mount_surface: 'vehicle' },
  'MNU511':    { mount_surface: 'desk' },
  'MNU502':    { mount_surface: 'vehicle' },
  'MMU111':    { mount_surface: 'desk' },
  'SCU102':    { features: ['kensington_lock'] },
  'CWX205':    { features: ['hand_strap'] },
  'MMX115KL':  { features: ['kensington_lock'] },
  'CWM400MP':  { series: 'Edge', bundle_priority: 2 },
  'MNU504':    { mount_surface: 'wall' },
  'MMU205':    { mount_surface: 'vehicle' },
  'KKX103':    {},
  'MMX108':    { features: ['hand_strap'] },
  'MMU103':    { mount_surface: 'vehicle' },
  'MMU118':    { mount_surface: 'pole' },
  'KKX101':    {},
  'CWX134':    {},
  'CWX132':    { features: ['screen_protector'] },
  'MNU005':    { mount_surface: 'vehicle' },
  'CWX210':    {},
  'KKX110W':   {},
  'KKX110B':   {},
  'MMU332':    { mount_surface: 'vehicle', bundle_priority: 1 },
  'MMU331':    { mount_surface: 'wall',    bundle_priority: 1 },
  'MVU332':    { mount_surface: 'wall',    bundle_priority: 1 },
  'MMU231':    { mount_surface: 'wall',    bundle_priority: 1 },
  'MMU230':    { mount_surface: 'pole',    bundle_priority: 1 },
  'MMU232':    { mount_surface: 'vehicle', bundle_priority: 1 },
  'MVU232':    { mount_surface: 'wall',    bundle_priority: 1 },
  'CWA302MP':  { series: 'Bold', bundle_priority: 1 },
  'CWM331MP':  { series: 'Edge', bundle_priority: 2 },
  'MWA336MP':  { series: 'Bold', bundle_priority: 2 },
  'MCU203':    {},
  'MCU204':    {},
  'CWX144':    { features: ['shoulder_strap'] },
  'CWA652MP':  { series: 'Bold', bundle_priority: 2 },
  'CWA655MH':  { series: 'Slim', bundle_priority: 2 },
  'CWM349MP':  { series: 'Pro', bundle_priority: 1 },
  'CWM344MP':  { series: 'Go', bundle_priority: 2 },
  'CWA659MP':  { series: 'Pro', bundle_priority: 1 },
  'CWA302KL':  { series: 'Bold', bundle_priority: 2 },
  'CWA653KL':  { series: 'Bold', bundle_priority: 2 },
  'MMU217':    { mount_surface: 'na' },
  'CWM347MP':  { series: 'Extreme', bundle_priority: 1 },
  'CWA305MH':  { series: 'Slim', bundle_priority: 2 },
  'PCA213':    {},
  'CPA310HS':  { features: ['hand_strap', 'shoulder_strap'], series: 'Edge', bundle_priority: 1 },
  'CPA310S':   { series: 'Edge', bundle_priority: 2 },
  'CWA5122MP': { series: 'Bold', bundle_priority: 2 },
  'CWA5123MP': { series: 'Bold', bundle_priority: 2 },
  'CWA4123MP': { series: 'Bold', bundle_priority: 2 },
  'CWA4122MP': { series: 'Bold', bundle_priority: 2 },
  'CPA320S':   { series: 'Edge', bundle_priority: 2 },
  'CWA5152MH': { features: ['magsafe'], series: 'Slim', bundle_priority: 2 },
  'CWA4152MH': { features: ['magsafe'], series: 'Slim', bundle_priority: 2 },
  'CWM504MP':  { series: 'Standard', bundle_priority: 2 },
  'HTA3021':   { series: 'Extreme', bundle_priority: 1 },
  'HPA3024':   { series: 'Extreme', bundle_priority: 1 },
  'HTA6024':   { series: 'Extreme', bundle_priority: 1 },
  'HPA3224':   { series: 'Extreme', bundle_priority: 1 },
  'CPA330S':   { series: 'Edge', bundle_priority: 2 },
  'CWA655MP':  { series: 'Slim', bundle_priority: 2 },
  'CPX302':    {},
};

export function getEnrichment(sku: string): ProductEnrichment {
  return PRODUCT_ENRICHMENT[sku] ?? runtimeEnrichmentCache.get(sku) ?? {};
}

export function hasEnrichment(sku: string): boolean {
  return sku in PRODUCT_ENRICHMENT || runtimeEnrichmentCache.has(sku);
}
