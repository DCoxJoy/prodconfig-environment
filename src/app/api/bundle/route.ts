// POST /api/bundle
// Builds live bundle options from BC catalog based on selected device, features, and scenarios.
// Returns up to 2 BundleOption[] — one per compatible case found in BC.
// Enrichment data (src/lib/enrichment.ts) drives scoring; Claude inference fills gaps for unknown SKUs.

import { NextResponse } from 'next/server';
import { getAllProducts, getFirstVariantIds, BcProductFull } from '../../../lib/bigcommerce';
import { getEnrichment, hasEnrichment } from '../../../lib/enrichment';
import { inferEnrichmentBatch, ProductForEnrichment } from '../../../lib/claudeEnrichment';
import { BundleItem, BundleOption, FeatureId, type IphoneScenarios, TabletScenarios } from '../../../types';

// ─── Custom field helpers ─────────────────────────────────────────────────────

type CfMap = Record<string, string | string[]>;

function parseCustomFields(fields: BcProductFull['custom_fields']): CfMap {
  const out: CfMap = {};
  for (const f of fields ?? []) {
    const existing = out[f.name];
    if (existing !== undefined) {
      out[f.name] = Array.isArray(existing) ? [...existing, f.value] : [existing, f.value];
    } else {
      out[f.name] = f.value;
    }
  }
  return out;
}

function getDeviceCompatList(cf: CfMap): string[] {
  const raw = cf.device_compatibility as string | undefined;
  if (!raw || raw.toLowerCase() === 'universal') return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// ─── Mount scoring ────────────────────────────────────────────────────────────
// Enrichment data preferred; keyword fallback for unrecognized SKUs.

const MOUNT_SURFACE_KEYWORDS: Record<string, string[]> = {
  vehicle: ['c-clamp', 'seat bolt', 'wheelchair', 'forklift'],
  wall:    ['on-wall', 'wall |', '| wall', 'counter', 'kiosk'],
  desk:    ['desk stand', 'tabletop'],
  pole:    ['tripod', 'mic stand', 'pole'],
};

function getSolutionTypes(cf: CfMap): string[] {
  const raw = cf.solution_type;
  if (!raw) return [];
  const values = Array.isArray(raw) ? raw : [raw as string];
  return values.flatMap(v => v.split(',').map(s => s.trim().toLowerCase())).filter(Boolean);
}

function scoreMount(name: string, sku: string, mountSurface: string, mountInstall?: string, solutionTypes: string[] = []): number {
  const enrichment = getEnrichment(sku);
  if (enrichment.mount_surface !== undefined) {
    if (enrichment.mount_surface !== mountSurface) return 0;
    // bundle_priority: lower number = higher rank. Priority 1 → +0.9, priority 2 → +0.8, none → +0
    const priorityBonus = enrichment.bundle_priority ? (10 - enrichment.bundle_priority) * 0.1 : 0;
    let score = 10 + priorityBonus;
    // solution_type bonus: reward mounts whose attachment method matches the user's preference.
    // Prefer drill-only mounts (+2) over drill+adhesive combo mounts (+1) when drill is wanted,
    // so VESA beats adhesive when the user selects permanent install.
    if (mountInstall && solutionTypes.length > 0) {
      const hasDrill    = solutionTypes.some(s => s.includes('drill'));
      const hasAdhesive = solutionTypes.some(s => s.includes('adhesive'));
      const hasRail     = solutionTypes.some(s => s.includes('rail') || s.includes('pole'));
      if (mountInstall === 'adhesive' && hasAdhesive)              score += 2;
      if (mountInstall === 'drill'    && hasDrill && !hasAdhesive) score += 2;
      if (mountInstall === 'drill'    && hasDrill && hasAdhesive)  score += 1;
      if (mountInstall === 'rail'     && hasRail)                  score += 2;
    }
    return score;
  }
  // Keyword fallback
  const lower = name.toLowerCase();
  const keywords = MOUNT_SURFACE_KEYWORDS[mountSurface] ?? [];
  return keywords.reduce((n, k) => n + (lower.includes(k) ? 1 : 0), 0);
}

// ─── Accessory scoring ────────────────────────────────────────────────────────

const FEATURE_TO_ACCESSORY_KEYWORDS: Partial<Record<FeatureId, string[]>> = {
  shoulder_strap:   ['shoulder strap'],
  hand_strap:       ['grip hand strap', 'hand strap'],
  screen_protector: ['screen protector'],
  kensington_lock:  ['lockdown', 'cable lock'],
  magsafe:          ['magsafe'],
};

function scoreAccessory(name: string, sku: string, features: FeatureId[]): number {
  const enrichment = getEnrichment(sku);
  if (enrichment.features !== undefined) {
    // Direct enrichment match: count how many selected features this accessory covers
    return enrichment.features.filter(f => features.includes(f)).length;
  }
  // Keyword fallback
  const lower = name.toLowerCase();
  let score = 0;
  for (const feat of features) {
    const keywords = FEATURE_TO_ACCESSORY_KEYWORDS[feat] ?? [];
    if (keywords.some(k => lower.includes(k))) score++;
  }
  return score;
}

// ─── Case scoring ─────────────────────────────────────────────────────────────
// Higher score = better match for this user's feature preferences.

function scoreCase(sku: string, features: FeatureId[]): number {
  const enrichment = getEnrichment(sku);
  let score = 0;
  // Feature coverage score
  if (enrichment.features?.length) {
    score += enrichment.features.filter(f => features.includes(f)).length * 2;
  }
  // Ruggedness bias: if user selected protection features, prefer Extreme/Bold
  const wantsRugged = features.some(f => ['ip_rating', 'mil_rating', 'chemical_resistant', 'thermo_defend'].includes(f));
  const wantsLight  = features.some(f => ['kick_stand', 'pencil_holder'].includes(f));
  const series = enrichment.series;
  if (wantsRugged && (series === 'Extreme' || series === 'Bold')) score += 3;
  if (wantsLight  && series === 'Slim') score += 2;
  // bundle_priority as tiebreaker (lower priority number = higher rank)
  if (enrichment.bundle_priority) score += (10 - enrichment.bundle_priority);
  return score;
}

// ─── Accessory icon ────────────────────────────────────────────────────────────

function iconForAccessory(name: string, sku: string): string {
  const enrichment = getEnrichment(sku);
  const feat = enrichment.features?.[0];
  if (feat === 'shoulder_strap') return 'briefcase';
  if (feat === 'hand_strap')     return 'hand-stop';
  if (feat === 'screen_protector') return 'device-tablet';
  if (feat === 'kensington_lock')  return 'lock';
  if (feat === 'magsafe')          return 'magnet';
  // Keyword fallback
  const lower = name.toLowerCase();
  if (lower.includes('shoulder')) return 'briefcase';
  if (lower.includes('hand strap') || lower.includes('grip')) return 'hand-stop';
  if (lower.includes('screen')) return 'device-tablet';
  if (lower.includes('lock'))   return 'lock';
  return 'tool';
}

// ─── Scenario → implied features ──────────────────────────────────────────────
// Maps environment answers to FeatureIds so scenario choices influence accessory scoring.

function getImpliedFeatures(
  scenarios: Partial<IphoneScenarios & TabletScenarios>,
  isIphone: boolean,
): FeatureId[] {
  const implied: FeatureId[] = [];
  if (isIphone) {
    const s = scenarios as Partial<IphoneScenarios>;
    if (s.carry_style === 'holster' || s.carry_style === 'hand') implied.push('hand_strap');
    if (s.hands_free === 'yes') implied.push('shoulder_strap');
  } else {
    const s = scenarios as Partial<TabletScenarios>;
    if (s.hands_free === 'yes') implied.push('shoulder_strap');
  }
  return implied;
}

// ─── Request / response types ─────────────────────────────────────────────────

interface BundleRequest {
  deviceName: string;
  isIphone: boolean;
  features: FeatureId[];
  scenarios: Partial<IphoneScenarios & TabletScenarios>;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: BundleRequest = await request.json();
    const { deviceName, isIphone, features, scenarios } = body;

    // Fetch all BC products (cached 5 min)
    const allProducts = await getAllProducts();

    // Parse custom fields and build a flat list with cf attached
    const products = allProducts.map(p => ({ ...p, cf: parseCustomFields(p.custom_fields) }));

    // Exclude any product with product_status = "Request for Quote"
    const active = products.filter(p => p.cf.product_status !== 'Request for Quote');

    // ── Cases: device-specific ─────────────────────────────────────────────
    const cases = active
      .filter(p => p.cf.product_type === 'Cases')
      .filter(p => getDeviceCompatList(p.cf).includes(deviceName));

    if (cases.length === 0) {
      console.warn(`[/api/bundle] No BC cases found for device: "${deviceName}"`);
      return NextResponse.json({ options: [] });
    }

    // ── Mounts: Universal, scored by scenario ──────────────────────────────
    const mounts = active.filter(p => p.cf.product_type === 'Mounts');
    const mountSurface = (scenarios as TabletScenarios).mount_surface;

    // ── Accessories: device-specific takes priority over universal ────────────
    // Tier 1: accessories with device_compatibility explicitly listing this device.
    // Tier 2: accessories with no device_compatibility (truly universal).
    // Using Tier 1 when available prevents universal accessories (e.g. tablet shoulder strap)
    // from overriding device-specific ones (e.g. iPhone belt clip holster).
    const allAccessories = active.filter(p => p.cf.product_type === 'Accessories');
    const specificAccessories = allAccessories.filter(p => getDeviceCompatList(p.cf).includes(deviceName));
    const universalAccessories = allAccessories.filter(p => getDeviceCompatList(p.cf).length === 0);
    const accessories = specificAccessories.length > 0 ? specificAccessories : universalAccessories;
    const effectiveFeatures = [...new Set([...features, ...getImpliedFeatures(scenarios, isIphone)])];

    // ── Infer enrichment for any SKUs not yet in the static map or cache ───
    const allRelevant = [...cases, ...mounts, ...allAccessories];
    const unknownSkus = allRelevant.filter(p => !hasEnrichment(p.sku));
    if (unknownSkus.length > 0) {
      console.log(`[/api/bundle] ${unknownSkus.length} SKUs without enrichment — calling Claude...`);
      const forInference: ProductForEnrichment[] = unknownSkus.map(p => ({
        sku: p.sku,
        name: p.name,
        product_type: p.cf.product_type as string,
        series: p.cf.series as string | undefined,
        certifications: p.cf.certifications as string | undefined,
      }));
      await inferEnrichmentBatch(forInference);
      // Results are now in runtimeEnrichmentCache, getEnrichment() picks them up automatically
    }

    // ── Select best mount ──────────────────────────────────────────────────
    // mount_install from scenarios (wall/desk only). For vehicle/pole, infer from surface:
    // vehicle always uses AMPs drill-down; pole always uses rail/clamp.
    const mountInstall: string | undefined =
      (scenarios as Partial<TabletScenarios>).mount_install
      ?? (mountSurface === 'vehicle' ? 'drill' : mountSurface === 'pole' ? 'rail' : undefined);

    let selectedMount: (typeof products)[0] | null = null;
    if (!isIphone && mountSurface && mountSurface !== 'na') {
      const scored = mounts
        .map(p => ({ p, score: scoreMount(p.name, p.sku, mountSurface, mountInstall, getSolutionTypes(p.cf)) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
      selectedMount = scored[0]?.p ?? null;
    }

    // ── Select best accessory ──────────────────────────────────────────────
    const scoredAcc = accessories
      .map(p => ({ p, score: scoreAccessory(p.name, p.sku, effectiveFeatures) }))
      .sort((a, b) => b.score - a.score);

    let selectedAccessory: (typeof products)[0] | null = null;
    if (scoredAcc[0]?.score > 0) {
      selectedAccessory = scoredAcc[0].p;
    } else {
      // No feature-matched accessory — fall back by priority: screen protector, shoulder strap, first in pool
      const FALLBACK_KEYWORDS = ['screen protector', 'shoulder strap', 'hand strap'];
      for (const kw of FALLBACK_KEYWORDS) {
        const found = accessories.find(p => p.name.toLowerCase().includes(kw));
        if (found) { selectedAccessory = found; break; }
      }
      if (!selectedAccessory && accessories.length > 0) selectedAccessory = accessories[0];
    }

    // ── Sort cases by enrichment score ─────────────────────────────────────
    const sortedCases = [...cases].sort((a, b) => scoreCase(b.sku, features) - scoreCase(a.sku, features));
    const topCases = sortedCases.slice(0, 2);

    // ── Collect product IDs we need variant IDs for ────────────────────────
    const selectedIds = [
      ...topCases.map(c => c.id),
      ...(selectedMount     ? [selectedMount.id]     : []),
      ...(selectedAccessory ? [selectedAccessory.id] : []),
    ];
    const variantIds = await getFirstVariantIds([...new Set(selectedIds)]);

    console.log(`[/api/bundle] Built for "${deviceName}": ${topCases.length} case(s), mount=${selectedMount?.sku ?? 'none'}, accessory=${selectedAccessory?.sku ?? 'none'} ("${selectedAccessory?.name ?? ''}")`);
    console.log(`[/api/bundle] Features sent:`, features);

    // ── Build BundleOption[] — one per case ────────────────────────────────
    const options: BundleOption[] = topCases.map(caseProduct => {
      const items: BundleItem[] = [
        {
          type:        'Case',
          icon:        'shield',
          name:        caseProduct.name,
          sku:         caseProduct.sku,
          unitPrice:   caseProduct.price,
          bcProductId: caseProduct.id,
          bcVariantId: variantIds[caseProduct.id],
        },
      ];

      if (selectedMount) {
        items.push({
          type:        'Mount',
          icon:        'layout-sidebar',
          name:        selectedMount.name,
          sku:         selectedMount.sku,
          unitPrice:   selectedMount.price,
          bcProductId: selectedMount.id,
          bcVariantId: variantIds[selectedMount.id],
        });
      }

      if (selectedAccessory) {
        items.push({
          type:        'Accessory',
          icon:        iconForAccessory(selectedAccessory.name, selectedAccessory.sku),
          name:        selectedAccessory.name,
          sku:         selectedAccessory.sku,
          unitPrice:   selectedAccessory.price,
          bcProductId: selectedAccessory.id,
          bcVariantId: variantIds[selectedAccessory.id],
        });
      }

      return { items };
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error('[/api/bundle error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
